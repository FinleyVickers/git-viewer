import { RepoViewer } from '../components/repo-viewer'

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-background">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Git Repository Viewer</h1>
        <RepoViewer />
      </div>
    </main>
  )
}
