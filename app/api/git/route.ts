import { NextResponse } from 'next/server'
import simpleGit from 'simple-git'
import path from 'path'
import { promises as fs } from 'fs'
import { getRepoPath, removeRepo } from './repos'

export async function POST(request: Request) {
  try {
    const { repoId, action } = await request.json()

    // Get repository path from file system
    const repoPath = await getRepoPath(repoId)
    if (!repoPath) {
      return new NextResponse('Repository not found', { status: 404 })
    }

    // Ensure the repository still exists
    try {
      await fs.access(repoPath)
    } catch {
      await removeRepo(repoId)
      return new NextResponse('Repository no longer exists', { status: 404 })
    }

    const git = simpleGit(repoPath)

    try {
      if (action === 'getInfo') {
        const [branch, remote, log] = await Promise.all([
          git.branch(),
          git.getRemotes(true),
          git.log(['--max-count=1'])
        ])
        
        return NextResponse.json({ branch, remote, log })
      }

      if (action === 'getCommits') {
        // Get all commits with graph info and branch details
        const log = await git.raw([
          'log',
          '--all',
          '--graph',
          '--pretty=format:%H%n%s%n%an%n%ae%n%at%n%P',
          '--date=unix'
        ]);

        // Parse the raw log output
        const commits = log.split('\n\n').map(commitBlock => {
          const [graphLine, ...commitLines] = commitBlock.split('\n');
          const [hash, message, authorName, authorEmail, timestamp, parents] = commitLines;
          
          // Parse timestamp safely
          let date;
          try {
            const timestampNum = parseInt(timestamp || '0', 10);
            date = new Date(timestampNum * 1000).toISOString();
          } catch (e) {
            console.warn('Invalid timestamp for commit:', hash, timestamp);
            date = new Date(0).toISOString(); // Use epoch if timestamp is invalid
          }
          
          return {
            hash,
            message,
            author_name: authorName,
            author_email: authorEmail,
            date,
            parents: parents ? parents.split(' ') : [],
            graph: graphLine
          };
        });

        return NextResponse.json({ all: commits })
      }

      if (action === 'getBranches') {
        const branches = await git.branch()
        return NextResponse.json(branches)
      }

      return new NextResponse('Invalid action', { status: 400 })
    } catch (error) {
      console.error('Git operation error:', error);
      return new NextResponse(
        error instanceof Error ? error.message : 'Git operation failed',
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Git API Error:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    )
  }
} 