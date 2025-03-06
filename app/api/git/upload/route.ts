import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import simpleGit from 'simple-git'
import { setRepoPath } from '../repos'

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files[]') as File[];

    if (files.length === 0) {
      return new NextResponse('No .git files found in the selected folder', { status: 400 });
    }

    // Generate a unique ID for this repository
    const repoId = uuidv4();
    const tempDir = path.join(process.cwd(), 'tmp', '_temp_' + repoId);
    const gitDir = path.join(tempDir, '.git');

    try {
      // Create temp directory
      await fs.mkdir(gitDir, { recursive: true });

      // Write all files to the temp directory maintaining the structure
      for (const file of files) {
        const fileName = file.name; // This will be the path within .git folder
        const filePath = path.join(gitDir, fileName);
        const fileDir = path.dirname(filePath);

        // Create directory if it doesn't exist
        await fs.mkdir(fileDir, { recursive: true });

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
      }

      // Verify it's a valid git repository
      const git = simpleGit(tempDir);
      const isRepo = await git.checkIsRepo();
      
      if (!isRepo) {
        throw new Error('Not a valid git repository');
      }

      // Move the repository to its final location
      await setRepoPath(repoId, gitDir);

      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      return NextResponse.json({ repoId });
    } catch (error) {
      // Clean up temp directory on error
      await fs.rm(tempDir, { recursive: true, force: true });
      
      if (error instanceof Error && error.message === 'Not a valid git repository') {
        return new NextResponse('Not a valid git repository', { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to upload repository',
      { status: 500 }
    );
  }
} 