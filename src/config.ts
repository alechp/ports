import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

export interface Config {
  scanPaths: string[];
}

const CONFIG_DIR = join(homedir(), '.config', 'ports');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * Ensure the config directory exists
 */
function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Get default config (always uses current working directory)
 */
function getDefaultConfig(): Config {
  return {
    scanPaths: [process.cwd()],
  };
}

/**
 * Load configuration from disk
 */
export function loadConfig(): Config {
  try {
    if (!existsSync(CONFIG_FILE)) {
      // First time - return current directory without saving
      // This allows the TUI to work anywhere without creating a config
      return getDefaultConfig();
    }

    const data = readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);

    // Validate config structure
    if (!config.scanPaths || !Array.isArray(config.scanPaths)) {
      console.error('Invalid config file, using current directory');
      return getDefaultConfig();
    }

    // Filter out paths that don't exist
    const validPaths = config.scanPaths.filter((path: string) => {
      if (!existsSync(path)) {
        console.warn(`Warning: Skipping non-existent path: ${path}`);
        return false;
      }
      return true;
    });

    // If no valid paths, use current directory
    if (validPaths.length === 0) {
      console.warn('No valid paths in config, using current directory');
      return getDefaultConfig();
    }

    return { scanPaths: validPaths };
  } catch (error) {
    console.error('Error loading config:', error);
    return getDefaultConfig();
  }
}

/**
 * Save configuration to disk
 */
export function saveConfig(config: Config): void {
  try {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

/**
 * Add a path to the scan paths
 */
export function addScanPath(path: string): Config {
  const config = loadConfig();

  // Check if path exists
  if (!existsSync(path)) {
    throw new Error(`Path does not exist: ${path}`);
  }

  // Check if path is already in the list
  if (config.scanPaths.includes(path)) {
    throw new Error(`Path already exists in scan list: ${path}`);
  }

  config.scanPaths.push(path);
  saveConfig(config);
  return config;
}

/**
 * Remove a path from the scan paths
 */
export function removeScanPath(path: string): Config {
  const config = loadConfig();
  config.scanPaths = config.scanPaths.filter(p => p !== path);

  // Ensure at least one path remains
  if (config.scanPaths.length === 0) {
    config.scanPaths = [process.cwd()];
  }

  saveConfig(config);
  return config;
}

/**
 * Get the config file path for display
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}
