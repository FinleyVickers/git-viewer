"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitBranch, GitMerge } from 'lucide-react'

interface BranchListProps {
  repoId: string
}

interface Branch {
  name: string
  current: boolean
  commit: string
  label: string
}

interface BranchDetails {
  current: boolean
  commit: string
  label: string
}

interface BranchSummary {
  branches: {
    [key: string]: BranchDetails
  }
}

export function BranchList({ repoId }: BranchListProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/git', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, action: 'getBranches' })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch branches')
        }

        const branchSummary: BranchSummary = await response.json()
        const branchList = Object.entries(branchSummary.branches).map(([name, details]) => ({
          name,
          current: details.current,
          commit: details.commit,
          label: details.label
        }))

        setBranches(branchList)
        setError(null)
      } catch (err) {
        setError('Failed to fetch branches')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranches()
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading branches...</p>
        </CardContent>
      </Card>
    )
  }

  const currentBranch = branches.find(b => b.current)
  const otherBranches = branches.filter(b => !b.current)

  return (
    <div className="space-y-6">
      {currentBranch && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Current Branch</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-semibold">{currentBranch.name}</p>
                  <Badge variant="default">Current</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{currentBranch.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-muted-foreground">
                  {currentBranch.commit.substring(0, 7)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitMerge className="h-5 w-5" />
            <span>Other Branches</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {otherBranches.map((branch) => (
              <div
                key={branch.name}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-sm text-muted-foreground">{branch.label}</p>
                </div>
                <p className="text-sm font-mono text-muted-foreground">
                  {branch.commit.substring(0, 7)}
                </p>
              </div>
            ))}
            {otherBranches.length === 0 && (
              <p className="text-sm text-muted-foreground">No other branches</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 