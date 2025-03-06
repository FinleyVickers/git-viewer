import { promises as fs } from 'fs'
import path from 'path'

const REPOS_DIR = path.join(process.cwd(), 'tmp');

export async function getRepoPath(repoId: string): Promise<string | null> {
  try {
    const repoPath = path.join(REPOS_DIR, repoId);
    await fs.access(repoPath);
    return repoPath;
  } catch {
    return null;
  }
}

export async function setRepoPath(repoId: string, gitDir: string): Promise<void> {
  // Create the tmp directory if it doesn't exist
  await fs.mkdir(REPOS_DIR, { recursive: true });
  
  // Create the repository directory
  const repoPath = path.join(REPOS_DIR, repoId);
  await fs.mkdir(repoPath, { recursive: true });

  // Copy the .git directory to the repository directory
  await fs.cp(gitDir, path.join(repoPath, '.git'), { recursive: true });
}

export async function removeRepo(repoId: string): Promise<void> {
  try {
    const repoPath = path.join(REPOS_DIR, repoId);
    await fs.rm(repoPath, { recursive: true, force: true });
  } catch {
    // Ignore errors if the repository doesn't exist
  }
} 