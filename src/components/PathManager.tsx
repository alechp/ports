import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { loadConfig, addScanPath, removeScanPath, getConfigPath } from '../config';
import { resolve } from 'path';
import { existsSync } from 'fs';

interface PathManagerProps {
  onExit: () => void;
  onPathsChanged: () => void;
}

export const PathManager: React.FC<PathManagerProps> = ({ onExit, onPathsChanged }) => {
  const [scanPaths, setScanPaths] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'view' | 'add'>('view');
  const [newPath, setNewPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load paths on mount
  useEffect(() => {
    const config = loadConfig();
    setScanPaths(config.scanPaths);
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError(null);
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  useInput((input, key) => {
    if (mode === 'view') {
      if (input === 'q' || key.escape) {
        onExit();
      } else if (input === 'a') {
        setMode('add');
        setNewPath('');
        setError(null);
      } else if (input === 'd' && scanPaths.length > 0) {
        // Delete selected path
        const pathToRemove = scanPaths[selectedIndex];
        try {
          const config = removeScanPath(pathToRemove);
          setScanPaths(config.scanPaths);
          setSelectedIndex(Math.max(0, Math.min(selectedIndex, config.scanPaths.length - 1)));
          setMessage(`Removed: ${pathToRemove}`);
          onPathsChanged();
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } else if (input === 'c') {
        // Add current working directory
        const cwd = process.cwd();
        try {
          const config = addScanPath(cwd);
          setScanPaths(config.scanPaths);
          setMessage(`Added current directory: ${cwd}`);
          onPathsChanged();
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } else if ((input === 'j' || key.downArrow) && scanPaths.length > 0) {
        setSelectedIndex(prev => Math.min(scanPaths.length - 1, prev + 1));
      } else if ((input === 'k' || key.upArrow) && scanPaths.length > 0) {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      }
    }
  });

  const handleAddPath = () => {
    if (!newPath.trim()) {
      setError('Path cannot be empty');
      return;
    }

    // Resolve the path (handles ~, relative paths, etc.)
    const resolvedPath = resolve(newPath.trim());

    // Check if path exists
    if (!existsSync(resolvedPath)) {
      setError(`Path does not exist: ${resolvedPath}`);
      return;
    }

    try {
      const config = addScanPath(resolvedPath);
      setScanPaths(config.scanPaths);
      setMode('view');
      setNewPath('');
      setMessage(`Added: ${resolvedPath}`);
      onPathsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (mode === 'add') {
    return (
      <Box flexDirection="column" paddingX={1} paddingTop={1}>
        {/* Header */}
        <Box
          borderStyle="bold"
          borderColor="blue"
          paddingX={2}
          marginBottom={1}
        >
          <Text bold color="blue">
            Add Scan Path
          </Text>
        </Box>

        {/* Error/Message */}
        {error && (
          <Box
            borderStyle="round"
            borderColor="red"
            paddingX={2}
            marginBottom={1}
          >
            <Text color="red">{error}</Text>
          </Box>
        )}

        {/* Input */}
        <Box
          borderStyle="single"
          borderColor="green"
          paddingX={1}
          marginBottom={1}
        >
          <Text color="cyan">Path: </Text>
          <TextInput
            value={newPath}
            onChange={setNewPath}
            onSubmit={handleAddPath}
          />
        </Box>

        {/* Help */}
        <Box
          borderStyle="single"
          borderColor="gray"
          paddingX={2}
          marginBottom={1}
        >
          <Text color="gray">
            Enter an absolute path or use relative paths (e.g., ../myproject, ~/projects)
          </Text>
        </Box>
        <Box
          borderStyle="single"
          borderColor="gray"
          paddingX={2}
        >
          <Text color="gray">
            Press Enter to add, Esc to cancel
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      {/* Header */}
      <Box
        borderStyle="bold"
        borderColor="blue"
        paddingX={2}
        marginBottom={1}
      >
        <Text bold color="blue">
          Manage Scan Paths
        </Text>
        <Text color="gray"> - Configure directories to scan for ports and URLs</Text>
      </Box>

      {/* Error/Message */}
      {error && (
        <Box
          borderStyle="round"
          borderColor="red"
          paddingX={2}
          marginBottom={1}
        >
          <Text color="red">{error}</Text>
        </Box>
      )}
      {message && (
        <Box
          borderStyle="round"
          borderColor="green"
          paddingX={2}
          marginBottom={1}
        >
          <Text color="green">{message}</Text>
        </Box>
      )}

      {/* Current Paths */}
      <Box
        borderStyle="single"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Text bold color="cyan" marginBottom={1}>
          Configured Scan Paths ({scanPaths.length}):
        </Text>
        {scanPaths.length === 0 ? (
          <Text color="gray">No paths configured. Add one with 'a' or 'c'.</Text>
        ) : (
          scanPaths.map((path, index) => (
            <Box key={path}>
              <Text color={index === selectedIndex ? 'green' : 'white'}>
                {index === selectedIndex ? '→ ' : '  '}
                {path}
              </Text>
            </Box>
          ))
        )}
      </Box>

      {/* Config File Location */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={2}
        marginBottom={1}
      >
        <Text color="gray">Config file: {getConfigPath()}</Text>
      </Box>

      {/* Help */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={2}
      >
        <Text color="gray">
          a: add path | c: add current dir | d: delete selected | j/k: navigate | q/Esc: back
        </Text>
      </Box>
    </Box>
  );
};
