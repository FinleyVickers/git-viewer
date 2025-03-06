"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RepoInfoProps {
  repoId: string
}

interface RepoDetails {
  currentBranch: string
  remoteUrl: string | null
  lastCommit: {
    hash: string
    message: string
    date: string
    author: string
  } | null
}

export function RepoInfo({ repoId }: RepoInfoProps) {
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepoInfo = async () => {
      try {
        const response = await fetch('/api/git', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, action: 'getInfo' })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch repository information')
        }

        const data = await response.json()
        
        setRepoDetails({
          currentBranch: data.branch.current,
          remoteUrl: data.remote[0]?.refs.fetch || null,
          lastCommit: data.log.latest ? {
            hash: data.log.latest.hash,
            message: data.log.latest.message,
            date: new Date(data.log.latest.date).toLocaleString(),
            author: data.log.latest.author_name
          } : null
        })
      } catch (err) {
        setError('Failed to fetch repository information')
        console.error(err)
      }
    }

    fetchRepoInfo()
  }, [repoId])

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Repository Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-muted-foreground">Current Branch</dt>
              <dd className="mt-1">{repoDetails?.currentBranch || 'Loading...'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Remote URL</dt>
              <dd className="mt-1">{repoDetails?.remoteUrl || 'No remote configured'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {repoDetails?.lastCommit && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Commit</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="font-medium text-muted-foreground">Hash</dt>
                <dd className="mt-1 font-mono">{repoDetails.lastCommit.hash}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Message</dt>
                <dd className="mt-1">{repoDetails.lastCommit.message}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Author</dt>
                <dd className="mt-1">{repoDetails.lastCommit.author}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Date</dt>
                <dd className="mt-1">{repoDetails.lastCommit.date}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 