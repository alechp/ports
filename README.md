# Port & URL Scanner TUI

A Terminal User Interface (TUI) application built with Bun, React, and Ink that scans all projects in `../../yapture/*` and `../../studio/*` directories to extract and display:

- Ports being used
- Purpose of each port
- All URLs referenced
- Source files where ports/URLs are found

## Features

- 📊 **Table Layout**: Clean table-based view showing all projects with expandable details
- 🔍 **Smart Search**: Filter projects by name, port number, port purpose, or URL
- 📝 **Expandable Rows**: Press Enter to expand and see all ports and URLs for each project
- 🖥️ **Viewport Management**: Auto-scrolling with height capping to prevent overflow
- ⌨️ **Keyboard Navigation**: Fully keyboard-driven interface with vi-style keys
- 🎨 **Color-Coded**: Easy to read with color-coded information
- 📍 **Full Paths**: Shows complete file paths for each project

## Installation

```bash
bun install
```

## Usage

### Start the TUI

```bash
# Using the symlinked run script (recommended)
./run

# Using the script directly
./scripts/run

# Using bun
bun start

# Using bun directly
bun index.tsx
```

### Test the Scanner

To see raw output of scanned projects:

```bash
bun test
# or
bun run test-scanner.ts
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
