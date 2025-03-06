# Git Repository Viewer

A modern web application built with Next.js that provides a beautiful and interactive visualization of local Git repositories. This tool allows you to explore Git repositories, view commit history, branch information, and more through an intuitive user interface.

## Features

- 📁 Browse and select local Git repositories
- 📤 Upload `.git` folders directly
- 📊 Visual commit graph representation
- 🔍 Detailed commit information
- 🌳 Branch overview and management
- 🎨 Beautiful UI powered by shadcn/ui
- 🌓 Dark/Light mode support

## Prerequisites

- Node.js 18.x or higher
- Git installed on your system

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/git-viewer.git
cd git-viewer
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15.2
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Git Operations**: simple-git
- **Language**: TypeScript
- **State Management**: React Hooks

## Project Structure

- `/app` - Next.js application routes and API endpoints
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/app/api/git` - Git operations API endpoints

## Features in Detail

### Repository Management
- Configure base directory for repository searches
- Upload `.git` folders directly
- Persistent repository storage

### Git Operations
- View commit history with graph visualization
- Browse branches and remote information
- View detailed commit information
- Real-time updates

### User Interface
- Modern and responsive design
- Dark/Light theme support
- Interactive commit graph
- Intuitive navigation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Git operations powered by [simple-git](https://github.com/steveukx/git-js)
