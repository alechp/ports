import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { ProjectInfo } from '../types';
import { scanAllProjects } from '../scanner';
import { ProjectTable } from './ProjectTable';
import { SearchInput } from './SearchInput';
import { FocusedCardView } from './FocusedCardView';
import { HelpModal } from './HelpModal';
import { PathManager } from './PathManager';
import { loadConfig } from '../config';
import { exec, spawn } from 'child_process';

export const PortsScanner: React.FC = () => {
  const [allProjects, setAllProjects] = useState<ProjectInfo[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [focusedProject, setFocusedProject] = useState<ProjectInfo | null>(null);
  const [urlScrollIndex, setUrlScrollIndex] = useState(0);
  const [portScrollIndex, setPortScrollIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showPathManager, setShowPathManager] = useState(false);
  const [focusedSection, setFocusedSection] = useState<'ports' | 'urls'>('ports');
  const [lastGPress, setLastGPress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scanPaths, setScanPaths] = useState<string[]>([]);

  // Helper function to copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    const proc = spawn('pbcopy');
    proc.stdin.write(text);
    proc.stdin.end();
    setToastMessage(`✓ Copied ${label} to clipboard`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Load scan paths and projects on mount
  useEffect(() => {
    const config = loadConfig();
    setScanPaths(config.scanPaths);
  }, []);

  // Load projects when scan paths change
  useEffect(() => {
    if (scanPaths.length === 0) return;

    const loadProjects = async () => {
      setLoading(true);
      try {
        const projects = await scanAllProjects(scanPaths);
        setAllProjects(projects);
        setFilteredProjects(projects);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };

    loadProjects();
  }, [scanPaths]);

  // Reload projects when paths are changed
  const reloadProjects = () => {
    const config = loadConfig();
    setScanPaths(config.scanPaths);
  };

  // Filter projects based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredProjects(allProjects);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allProjects.filter(p =>
        p.repo.toLowerCase().includes(query) ||
        p.ports.some(port => port.port.includes(query) || port.purpose.toLowerCase().includes(query)) ||
        p.urls.some(url => url.toLowerCase().includes(query))
      );
      setFilteredProjects(filtered);
    }
    setSelectedIndex(0);
    setExpandedIndexes(new Set());
    setScrollOffset(0);
  }, [searchQuery, allProjects]);

  // Keyboard navigation
  useInput((input, key) => {
    // Global quit
    if (input === 'q' && !searchMode && focusedProject === null && !showPathManager) {
      process.exit(0);
    }

    // Help modal handler (works in all modes)
    if (input === '?' && !searchMode && !showPathManager) {
      setShowHelp(prev => !prev);
      return;
    }

    // Path manager handler (works when not in search mode or focused view)
    if (input === 'p' && !searchMode && focusedProject === null && !showPathManager) {
      setShowPathManager(true);
      return;
    }

    // If we're in focused card mode
    if (focusedProject !== null && !searchMode) {
      const maxUrlIndex = Math.max(0, focusedProject.urls.length - 1);
      const maxPortIndex = Math.max(0, focusedProject.ports.length - 1);

      if (key.escape) {
        // Exit focus mode
        setFocusedProject(null);
        setUrlScrollIndex(0);
        setPortScrollIndex(0);
        setFocusedSection('ports');
        return;
      } else if (key.return) {
        // Open in browser
        if (focusedSection === 'ports' && focusedProject.ports[portScrollIndex]) {
          const port = focusedProject.ports[portScrollIndex].port;
          const url = `http://localhost:${port}`;
          exec(`open "${url}"`);
        } else if (focusedSection === 'urls' && focusedProject.urls[urlScrollIndex]) {
          const url = focusedProject.urls[urlScrollIndex];
          exec(`open "${url}"`);
        }
        return;
      } else if (input === 'y') {
        // Yank to clipboard
        if (focusedSection === 'ports' && focusedProject.ports[portScrollIndex]) {
          const port = focusedProject.ports[portScrollIndex].port;
          copyToClipboard(port, `port ${port}`);
        } else if (focusedSection === 'urls' && focusedProject.urls[urlScrollIndex]) {
          const url = focusedProject.urls[urlScrollIndex];
          copyToClipboard(url, 'URL');
        }
        return;
      } else if (input === 'G') {
        // Go to bottom of current section
        if (focusedSection === 'ports') {
          setPortScrollIndex(maxPortIndex);
        } else {
          setUrlScrollIndex(maxUrlIndex);
        }
        return;
      } else if (input === 'g') {
        // Handle gg (go to top)
        const now = Date.now();
        if (now - lastGPress < 500) {
          // Double g pressed - go to top
          if (focusedSection === 'ports') {
            setPortScrollIndex(0);
          } else {
            setUrlScrollIndex(0);
          }
          setLastGPress(0);
        } else {
          // First g press
          setLastGPress(now);
        }
        return;
      } else if (key.ctrl && input === 'd') {
        // Page down
        if (focusedSection === 'ports') {
          setPortScrollIndex(prev => Math.min(maxPortIndex, prev + 10));
        } else {
          setUrlScrollIndex(prev => Math.min(maxUrlIndex, prev + 10));
        }
        return;
      } else if (key.ctrl && input === 'u') {
        // Page up
        if (focusedSection === 'ports') {
          setPortScrollIndex(prev => Math.max(0, prev - 10));
        } else {
          setUrlScrollIndex(prev => Math.max(0, prev - 10));
        }
        return;
      } else if (key.ctrl && input === 'n') {
        // Toggle to next section (ports -> urls)
        if (focusedSection === 'ports') {
          setFocusedSection('urls');
        }
        return;
      } else if (key.ctrl && input === 'p') {
        // Toggle to previous section (urls -> ports)
        if (focusedSection === 'urls') {
          setFocusedSection('ports');
        }
        return;
      } else if (input === 'j' || key.downArrow) {
        // Scroll down through current section
        if (focusedSection === 'urls') {
          setUrlScrollIndex(prev => Math.min(maxUrlIndex, prev + 1));
        } else {
          setPortScrollIndex(prev => Math.min(maxPortIndex, prev + 1));
        }
        return;
      } else if (input === 'k' || key.upArrow) {
        // Scroll up through current section
        if (focusedSection === 'urls') {
          setUrlScrollIndex(prev => Math.max(0, prev - 1));
        } else {
          setPortScrollIndex(prev => Math.max(0, prev - 1));
        }
        return;
      } else if (input === '/') {
        // Open search while in focus mode
        setSearchMode(true);
        return;
      }
      return; // Ignore other keys in focus mode
    }

    // Ctrl keys are now handled by SearchInput when in search mode
    // Only handle them here when NOT in search mode
    if (!searchMode) {
      if (key.ctrl && input === 'd') {
        // Page down
        setSelectedIndex(prev => {
          const newIndex = Math.min(filteredProjects.length - 1, prev + 10);
          const terminalHeight = process.stdout.rows || 30;
          const maxVisibleRows = Math.min(10, Math.max(3, Math.floor((terminalHeight - 8) / 3)));
          if (newIndex >= scrollOffset + maxVisibleRows) {
            setScrollOffset(Math.min(filteredProjects.length - maxVisibleRows, newIndex - Math.floor(maxVisibleRows / 2)));
          }
          return newIndex;
        });
        return;
      } else if (key.ctrl && input === 'u') {
        // Page up
        setSelectedIndex(prev => {
          const newIndex = Math.max(0, prev - 10);
          if (newIndex < scrollOffset) {
            setScrollOffset(Math.max(0, newIndex - Math.floor(10 / 2)));
          }
          return newIndex;
        });
        return;
      } else if (key.ctrl && input === 'l') {
        // Expand current
        setExpandedIndexes(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedIndex);
          return newSet;
        });
        return;
      } else if (key.ctrl && input === 'h') {
        // Collapse current
        setExpandedIndexes(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedIndex);
          return newSet;
        });
        return;
      } else if (key.ctrl && input === 'p') {
        // Up
        setSelectedIndex(prev => {
          const newIndex = Math.max(0, prev - 1);
          if (newIndex < scrollOffset) {
            setScrollOffset(newIndex);
          }
          return newIndex;
        });
        return;
      } else if (key.ctrl && input === 'n') {
        // Down
        setSelectedIndex(prev => {
          const newIndex = Math.min(filteredProjects.length - 1, prev + 1);
          const terminalHeight = process.stdout.rows || 30;
          const maxVisibleRows = Math.min(10, Math.max(3, Math.floor((terminalHeight - 8) / 3)));
          if (newIndex >= scrollOffset + maxVisibleRows) {
            setScrollOffset(newIndex - maxVisibleRows + 1);
          }
          return newIndex;
        });
        return;
      }
    }

    // Search mode controls
    if (searchMode) {
      if (key.escape) {
        setSearchMode(false);
        setSearchQuery('');
        return;
      }
      if (key.return) {
        // Exit search mode and focus on selected card
        if (filteredProjects[selectedIndex]) {
          setSearchMode(false);
          setFocusedProject(filteredProjects[selectedIndex]);
          setUrlScrollIndex(0);
          setPortScrollIndex(0);
          setFocusedSection('ports');
          // Auto-expand the focused card
          setExpandedIndexes(prev => {
            const newSet = new Set(prev);
            newSet.add(selectedIndex);
            return newSet;
          });
        }
        return;
      }
      return;
    }

    // Navigation controls
    if (key.upArrow || input === 'k') {
      setSelectedIndex(prev => {
        const newIndex = Math.max(0, prev - 1);
        // Adjust scroll if needed
        if (newIndex < scrollOffset) {
          setScrollOffset(newIndex);
        }
        return newIndex;
      });
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex(prev => {
        const newIndex = Math.min(filteredProjects.length - 1, prev + 1);
        // Cap at 10 max visible rows to prevent overflow when expanding
        const terminalHeight = process.stdout.rows || 30;
        const maxVisibleRows = Math.min(10, Math.max(3, Math.floor((terminalHeight - 8) / 3)));

        // Adjust scroll if needed
        if (newIndex >= scrollOffset + maxVisibleRows) {
          setScrollOffset(newIndex - maxVisibleRows + 1);
        }
        return newIndex;
      });
    } else if (key.return) {
      // Enter focus mode for selected card
      if (filteredProjects[selectedIndex]) {
        setFocusedProject(filteredProjects[selectedIndex]);
        setUrlScrollIndex(0);
        setPortScrollIndex(0);
        setFocusedSection('ports');
        // Auto-expand the focused card
        setExpandedIndexes(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedIndex);
          return newSet;
        });
      }
    } else if (input === ' ') {
      // Toggle expansion
      setExpandedIndexes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(selectedIndex)) {
          newSet.delete(selectedIndex);
        } else {
          newSet.add(selectedIndex);
        }
        return newSet;
      });
    } else if (input === 'l') {
      // Expand current (vim: move right/open)
      setExpandedIndexes(prev => {
        const newSet = new Set(prev);
        newSet.add(selectedIndex);
        return newSet;
      });
    } else if (input === 'h') {
      // Collapse current (vim: move left/close)
      setExpandedIndexes(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedIndex);
        return newSet;
      });
    } else if (input === '/') {
      setSearchMode(true);
    } else if (input === 'x') {
      // Collapse all
      setExpandedIndexes(new Set());
    } else if (input === 'X') {
      // Expand all
      setExpandedIndexes(new Set(filteredProjects.map((_, i) => i)));
    } else if (input === 'G') {
      // Go to bottom
      const newIndex = filteredProjects.length - 1;
      setSelectedIndex(newIndex);
      const terminalHeight = process.stdout.rows || 30;
      const maxVisibleRows = Math.min(10, Math.max(3, Math.floor((terminalHeight - 8) / 3)));
      if (newIndex >= maxVisibleRows) {
        setScrollOffset(newIndex - maxVisibleRows + 1);
      }
    } else if (input === 'g') {
      // Handle gg (go to top)
      const now = Date.now();
      if (now - lastGPress < 500) {
        // Double g pressed - go to top
        setSelectedIndex(0);
        setScrollOffset(0);
        setLastGPress(0);
      } else {
        // First g press
        setLastGPress(now);
      }
    }
  });

  // If path manager is shown, render it
  if (showPathManager) {
    return (
      <PathManager
        onExit={() => setShowPathManager(false)}
        onPathsChanged={reloadProjects}
      />
    );
  }

  if (loading) {
    return (
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text bold color="cyan">
          Loading projects...
        </Text>
        <Text color="gray">
          Scanning {scanPaths.length} path{scanPaths.length !== 1 ? 's' : ''}...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        borderStyle="round"
        borderColor="red"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Text bold color="red">
          Error
        </Text>
        <Text>{error}</Text>
        <Text color="gray">Press q to quit</Text>
      </Box>
    );
  }

  // If help modal is shown, render it
  if (showHelp) {
    return <HelpModal />;
  }

  // If we're in focused card mode, render that view instead
  if (focusedProject !== null) {
    return (
      <FocusedCardView
        project={focusedProject}
        urlScrollIndex={urlScrollIndex}
        portScrollIndex={portScrollIndex}
        focusedSection={focusedSection}
        toastMessage={toastMessage}
      />
    );
  }

  // Calculate viewport - cap at 10 rows to prevent overflow when expanding
  const terminalHeight = process.stdout.rows || 30;
  const maxVisibleRows = Math.min(10, Math.max(3, Math.floor((terminalHeight - 8) / 3)));
  const visibleProjects = filteredProjects.slice(scrollOffset, scrollOffset + maxVisibleRows);
  const visibleExpandedIndexes = new Set(
    Array.from(expandedIndexes).map(idx => idx - scrollOffset).filter(idx => idx >= 0 && idx < maxVisibleRows)
  );

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      {/* Toast Notification */}
      {toastMessage && (
        <Box
          borderStyle="round"
          borderColor="green"
          paddingX={2}
          marginBottom={1}
        >
          <Text color="green">{toastMessage}</Text>
        </Box>
      )}

      {/* Header */}
      <Box
        borderStyle="bold"
        borderColor="blue"
        paddingX={2}
        marginBottom={1}
      >
        <Text bold color="blue">
          Port & URL Scanner
        </Text>
        <Text color="gray"> - </Text>
        <Text color="gray">
          / search, hjkl navigate, Enter focus, p paths, ? help, q quit
        </Text>
      </Box>

      {/* Search Box */}
      <Box
        borderStyle="single"
        borderColor={searchMode ? 'green' : 'cyan'}
        paddingX={1}
        marginBottom={1}
      >
        <Text color="cyan">Search: </Text>
        {searchMode ? (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onCtrlH={() => {
              setExpandedIndexes(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedIndex);
                return newSet;
              });
            }}
            onCtrlL={() => {
              setExpandedIndexes(prev => {
                const newSet = new Set(prev);
                newSet.add(selectedIndex);
                return newSet;
              });
            }}
            onCtrlN={() => {
              setSelectedIndex(prev => {
                const newIndex = Math.min(filteredProjects.length - 1, prev + 1);
                const terminalHeight = process.stdout.rows || 30;
                const maxVisibleRows = Math.min(10, Math.max(3, Math.floor((terminalHeight - 8) / 3)));
                if (newIndex >= scrollOffset + maxVisibleRows) {
                  setScrollOffset(newIndex - maxVisibleRows + 1);
                }
                return newIndex;
              });
            }}
            onCtrlP={() => {
              setSelectedIndex(prev => {
                const newIndex = Math.max(0, prev - 1);
                if (newIndex < scrollOffset) {
                  setScrollOffset(newIndex);
                }
                return newIndex;
              });
            }}
            onEscape={() => {
              setSearchMode(false);
              setSearchQuery('');
            }}
          />
        ) : (
          <Text color="gray">{searchQuery || '(press / to search)'}</Text>
        )}
      </Box>

      {/* Scroll Indicators */}
      {scrollOffset > 0 && (
        <Box justifyContent="center">
          <Text color="yellow">↑ {scrollOffset} more above</Text>
        </Box>
      )}

      {/* Project Table */}
      <ProjectTable
        projects={visibleProjects}
        selectedIndex={selectedIndex - scrollOffset}
        expandedIndexes={visibleExpandedIndexes}
      />

      {/* Scroll Indicators */}
      {scrollOffset + maxVisibleRows < filteredProjects.length && (
        <Box justifyContent="center">
          <Text color="yellow">↓ {filteredProjects.length - scrollOffset - maxVisibleRows} more below</Text>
        </Box>
      )}

      {/* Status Bar */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        marginTop={1}
      >
        <Text color="gray">
          Projects: {filteredProjects.length}/{allProjects.length}
        </Text>
        <Text color="gray"> | </Text>
        <Text color="gray">
          Selected: {selectedIndex + 1}/{filteredProjects.length}
        </Text>
        <Text color="gray"> | </Text>
        <Text color="gray">
          Expanded: {expandedIndexes.size}
        </Text>
      </Box>
    </Box>
  );
};
