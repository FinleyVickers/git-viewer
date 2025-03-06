"use client"

import { useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RepoInfo } from '@/components/repo-info'
import { BranchList } from '@/components/branch-list'
import { FolderOpen } from 'lucide-react'
import { GitGraph } from '@/components/git-graph'

export function RepoViewer() {
  const [repoId, setRepoId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFolderSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create a FormData object to send the files
      const formData = new FormData();
      
      // Filter and add only files from the .git directory
      Array.from(files).forEach((file) => {
        const relativePath = (file as any).webkitRelativePath;
        if (relativePath.includes('.git/')) {
          // Keep the .git folder structure
          const pathInGit = relativePath.split('.git/')[1];
          if (pathInGit) { // Only add files inside .git, not the .git folder itself
            formData.append('files[]', file, pathInGit);
          }
        }
      });

      // Upload the .git folder
      const response = await fetch('/api/git/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload repository');
      }

      const { repoId } = await response.json();
      setRepoId(repoId);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error handling folder upload:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload repository');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderOpen className="mr-2 h-4 w-4" />
              Select Repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Open Git Repository</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div>
                  <label htmlFor="folderPicker" className="block text-sm font-medium mb-2">
                    Select .git Folder
                  </label>
                  <input
                    type="file"
                    id="folderPicker"
                    // @ts-ignore
                    webkitdirectory=""
                    className="hidden"
                    onChange={handleFolderSelect}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('folderPicker')?.click()}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Browse for .git Folder
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select the .git folder from your repository to visualize its history
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {repoId && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Repository Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="graph" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="graph">Git Graph</TabsTrigger>
                  <TabsTrigger value="info">Repository Info</TabsTrigger>
                  <TabsTrigger value="branches">Branches</TabsTrigger>
                </TabsList>
                <TabsContent value="graph" className="space-y-4">
                  <GitGraph repoId={repoId} />
                </TabsContent>
                <TabsContent value="info" className="space-y-4">
                  <RepoInfo repoId={repoId} />
                </TabsContent>
                <TabsContent value="branches" className="space-y-4">
                  <BranchList repoId={repoId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 