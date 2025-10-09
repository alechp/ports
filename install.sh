#!/usr/bin/env bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPO="alechp/ports"
INSTALL_DIR="${HOME}/.local/share/ports"
BIN_DIR="${HOME}/.local/bin"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Port & URL Scanner CLI - Installer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is not installed!${NC}"
    echo -e "Please install Bun first: ${YELLOW}curl -fsSL https://bun.sh/install | bash${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Bun found"

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

# Clone or update repo
if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "${YELLOW}⚠${NC}  Existing installation found, updating..."
    cd "$INSTALL_DIR"
    git pull
else
    echo -e "${BLUE}📦 Downloading ports CLI...${NC}"
    git clone "https://github.com/${REPO}.git" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
bun install

# Create symlink
echo -e "${BLUE}🔗 Creating symlink...${NC}"
ln -sf "$INSTALL_DIR/cli.tsx" "$BIN_DIR/ports"
chmod +x "$BIN_DIR/ports"

# Check if $HOME/.local/bin is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo ""
    echo -e "${YELLOW}⚠${NC}  ${BIN_DIR} is not in your PATH"
    echo -e "Add this to your shell config (.bashrc, .zshrc, etc.):"
    echo -e "${BLUE}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
    echo ""
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Installation complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Run ${YELLOW}ports${NC} to get started!"
echo -e "Run ${YELLOW}ports --help${NC} to see all commands"
echo ""
