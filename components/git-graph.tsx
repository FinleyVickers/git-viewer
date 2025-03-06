"use client"

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GitCommit, GitBranch, GitMerge } from 'lucide-react'

interface GitGraphProps {
  repoId: string
}

interface CommitNode {
  hash: string
  message: string
  date: string
  author_name: string
  author_email: string
  parents: string[]
  graph: string
  x: number
  y: number
}

export function GitGraph({ repoId }: GitGraphProps) {
  const [commits, setCommits] = useState<CommitNode[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch('/api/git', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, action: 'getCommits' })
        })

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch commit history');
        }

        const data = await response.json()
        
        // Process commits to add position information
        const processedCommits = data.all.map((commit: CommitNode, index: number) => ({
          ...commit,
          x: 0,
          y: index * 60
        }))

        setCommits(processedCommits)
        setError(null)
      } catch (err) {
        console.error('Error fetching commits:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch commit history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommits()
  }, [repoId])

  useEffect(() => {
    if (!canvasRef.current || commits.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = 800
    canvas.height = Math.max(600, commits.length * 60 + 100)

    // Draw commit nodes and connections
    commits.forEach((commit, index) => {
      const x = 100
      const y = commit.y + 30

      // Draw branch lines and graph characters
      ctx.beginPath()
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2

      // Draw vertical line to next commit
      if (index < commits.length - 1) {
        ctx.moveTo(x, y)
        ctx.lineTo(x, commits[index + 1].y + 30)
        ctx.stroke()
      }

      // Draw commit circle
      ctx.beginPath()
      ctx.fillStyle = '#0ea5e9'
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Draw merge connections
      if (commit.parents.length > 1) {
        commit.parents.slice(1).forEach(parentHash => {
          const parentCommit = commits.find(c => c.hash === parentHash)
          if (parentCommit) {
            ctx.beginPath()
            ctx.strokeStyle = '#94a3b8'
            ctx.lineWidth = 2
            const startX = x
            const startY = y
            const endX = x
            const endY = parentCommit.y + 30
            
            // Draw curved line for merge
            ctx.moveTo(startX, startY)
            ctx.bezierCurveTo(
              startX + 40, startY,
              endX + 40, endY,
              endX, endY
            )
            ctx.stroke()
          }
        })
      }
    })
  }, [commits])

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading commit graph...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Git Graph</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ minHeight: '600px' }}
            />
            <div className="absolute top-0 left-[150px] right-0 space-y-[30px] pt-[15px]">
              {commits.map((commit) => (
                <div
                  key={commit.hash}
                  className="flex items-center justify-between pr-4"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {commit.author_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm leading-none">
                        {commit.message}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{commit.hash.substring(0, 7)}</span>
                        <span>•</span>
                        <span>{commit.author_name}</span>
                        <span>•</span>
                        <span>{new Date(commit.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 