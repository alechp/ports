# Port & URL Scanner CLI

A powerful CLI tool built with Bun, React, and Ink for scanning and managing ports and URLs across your projects.

## Features

- 🎨 **Interactive TUI**: Beautiful terminal interface for browsing ports and URLs
- 🔍 **Smart Search**: Filter projects by name, port number, purpose, or URL
- 📊 **Port Conflict Detection**: Generate reports of ports in use to avoid conflicts
- 📁 **Directory Indexing**: Scan any directory for ports and URLs (with Claude Code integration)
- ⚡ **Auto-Updates**: Upgrade to latest version with a single command
- ⌨️ **Vim-style Navigation**: hjkl, gg, G, Ctrl+D/U and more
- 📋 **Clipboard Integration**: Copy ports and URLs with `y`
- 🌐 **Browser Integration**: Open ports/URLs directly in browser with Enter
- 🎯 **Focused Mode**: Deep dive into individual projects

## Installation

### One-Line Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/alechp/ports/master/install.sh | bash
```

### Using Bun

```bash
bun install -g github:alechp/ports
```

### From Source

```bash
git clone https://github.com/alechp/ports.git
cd ports
bun install
bun link
```

## Commands

### `ports` or `ports tui`

Launch the interactive TUI to browse all ports and URLs.

```bash
ports
# or explicitly
ports tui
```

### `ports upgrade`

Upgrade to the latest version from GitHub releases.

```bash
ports upgrade
```

This command will:
- Check for the latest release
- Download and install it automatically
- Show version comparison

### `ports output`

Generate a report of all ports in use across your projects. Perfect for avoiding port conflicts!

```bash
# Text format (default)
ports output

# JSON format
ports output --format json

# Markdown format (great for documentation)
ports output --format markdown
```

**Example output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COMMON LOCAL PORTS - AVOID THESE TO PREVENT CONFLICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Projects Scanned: 24
Total Unique Ports: 18

Ports in Use:

  Port 3000  - Web Server           (frontend, api, admin)
  Port 3001  - API Server            (backend)
  Port 5432  - Database              (postgres)
  ...
```

### `ports index <directory>`

Scan a specific directory for ports and URLs. Uses Claude Code CLI if available, otherwise falls back to built-in scanner.

```bash
# Index a directory
ports index /path/to/project

# Save output to file
ports index /path/to/project --output results.json
```

## Keyboard Shortcuts

### Main List View

| Key | Action |
|-----|--------|
| `↑` / `k` | Move selection up |
| `↓` / `j` | Move selection down |
| `gg` | Go to top of list |
| `G` | Go to bottom of list |
| `Ctrl+D` | Page down (10 items) |
| `Ctrl+U` | Page up (10 items) |
| `l` | Expand selected project (vim: right/open) |
| `h` | Collapse selected project (vim: left/close) |
| `Ctrl+L` | Expand selected project (works in search mode) |
| `Ctrl+H` | Collapse selected project (works in search mode) |
| `Ctrl+N` | Move down (works in search mode) |
| `Ctrl+P` | Move up (works in search mode) |
| `Enter` | Focus on selected project (enter detail view) |
| `Space` | Toggle expand/collapse selected project |
| `/` | Open search box |
| `x` | Collapse all expanded projects |
| `X` | Expand all projects |
| `Esc` | Cancel search |
| `q` / `Ctrl+C` | Quit application |
| `?` | Show help modal |

### Focused Card View

| Key | Action |
|-----|--------|
| `↑` / `k` | Scroll up through current section (Ports or URLs) |
| `↓` / `j` | Scroll down through current section (Ports or URLs) |
| `gg` | Go to top of current section |
| `G` | Go to bottom of current section |
| `Ctrl+D` | Page down (10 items) |
| `Ctrl+U` | Page up (10 items) |
| `Ctrl+N` | Switch to next section (Ports → URLs) |
| `Ctrl+P` | Switch to previous section (URLs → Ports) |
| `y` | Yank (copy) port number or URL to clipboard |
| `Enter` | Open port (localhost:PORT) or URL in browser |
| `Esc` | Return to main list |
| `/` | Open search |
| `?` | Show help modal |

## How It Works

The scanner looks through the following files in each project:

### Configuration Files
- `package.json`
- `docker-compose.yml` / `docker-compose.yaml`
- `.env` / `.env.local` / `.env.development`
- `vite.config.ts/js`
- `next.config.js`
- `nuxt.config.ts`
- `astro.config.mjs`
- `README.md`

### Directories
- `config/`
- `src/config/`
- `server/config/`

### Port Detection

The scanner uses multiple regex patterns to detect ports:
- Environment variables: `PORT=3000`
- Docker mappings: `-p 3000:3000`
- Server configurations: `listen:3000`
- URLs: `localhost:3000`, `127.0.0.1:3000`

### Purpose Detection

Ports are automatically categorized by context:
- API Server
- Web Server
- Database (PostgreSQL, MongoDB, etc.)
- Redis
- Proxy
- gRPC Server
- Development Server

### URL Extraction

Extracts all HTTP/HTTPS URLs while filtering out:
- Example/placeholder URLs
- Template variables (`${VAR}`, `{{VAR}}`)
- Localhost addresses

## File Structure

```
ports/
├── index.tsx         # Main entry point
├── src/
│   ├── types.ts                      # TypeScript type definitions
│   ├── scanner.ts                    # Project scanner logic
│   └── components/
│       ├── PortsScanner.tsx          # Main TUI component with state management
│       └── ProjectTable.tsx          # Table component with expandable rows
├── test-scanner.ts   # Test script for scanner
├── package.json      # Dependencies and scripts
├── README.md         # This file
├── scripts/
│   └── run           # Run script for the TUI
└── run               # Symlink to scripts/run
```

## Technologies

- [Bun](https://bun.sh) - Fast JavaScript runtime
- [Ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [React](https://react.dev) - UI component library
- TypeScript - Type-safe development
- [Chalk](https://github.com/chalk/chalk) - Terminal string styling

## Example Output

The TUI displays projects in a table format:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Port & URL Scanner - / to search, ↑↓ to navigate, Enter to expand... ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────────────────────────────────────────────────────────┐
│ Search: (press / to search)                                            │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ Project                      Ports      URLs       Path                │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ ▶ pppokemon                  5          9          /Users/.../pppokemon│
└────────────────────────────────────────────────────────────────────────┘
```

Press Enter on a project to expand and see all details:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ▼ pppokemon                  5          9          /Users/.../pppokemon│
├────────────────────────────────────────────────────────────────────────┤
│  Full Path: /Users/alechp/Code/studio/pppokemon                        │
│                                                                         │
│  Ports (5):                                                             │
│    • Port 3000   - Unknown              (docker-compose.yml)           │
│    • Port 3001   - Database             (docker-compose.yml)           │
│    • Port 5432   - Database             (.env.local)                   │
│    • Port 4321   - Unknown              (README.md)                    │
│    • Port 3742   - Unknown              (astro.config.mjs)             │
│                                                                         │
│  URLs (9):                                                              │
│    • https://bun.sh                                                     │
│    • https://github.com/your-org/ppp-website.git                       │
│    • https://pro.coinmarketcap.com/                                    │
│    • https://docs.astro.build                                           │
│    • ...                                                                │
└────────────────────────────────────────────────────────────────────────┘
```

## Notes

- The scanner automatically scans both `../../yapture/*` and `../../studio/*` directories
- Projects without detected ports or URLs will still appear in the list
- The scanner ignores hidden directories (starting with `.`)
- Port numbers are filtered to be between 1000 and 65535

## License

Private / Internal Tool
