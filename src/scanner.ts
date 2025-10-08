import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { PortInfo, ProjectInfo } from './types';

const PORT_PATTERNS = [
  /PORT[_\s]*[=:]\s*(\d+)/gi,
  /port[:\s]*(\d+)/gi,
  /listen[:\s]*(\d+)/gi,
  /-p\s+(\d+):/gi,
  /localhost:(\d+)/gi,
  /127\.0\.0\.1:(\d+)/gi,
  /:(\d{4,5})/g,
];

const URL_PATTERNS = [
  /https?:\/\/[^\s"'<>)}\]]+/gi,
  /[A-Z_]*URL[_\s]*[=:]\s*["']([^"']+)["']/gi,
];

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readFileIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

function extractPorts(content: string, source: string): PortInfo[] {
  const ports = new Set<string>();
  const portInfos: PortInfo[] = [];

  for (const pattern of PORT_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const port = match[1];
      if (port && parseInt(port) > 1000 && parseInt(port) < 65536) {
        if (!ports.has(port)) {
          ports.add(port);
          // Try to determine purpose from context
          const contextStart = Math.max(0, match.index! - 50);
          const contextEnd = Math.min(content.length, match.index! + 50);
          const context = content.substring(contextStart, contextEnd);

          let purpose = 'Unknown';
          if (context.toLowerCase().includes('api')) purpose = 'API Server';
          else if (context.toLowerCase().includes('web') || context.toLowerCase().includes('frontend')) purpose = 'Web Server';
          else if (context.toLowerCase().includes('db') || context.toLowerCase().includes('database')) purpose = 'Database';
          else if (context.toLowerCase().includes('redis')) purpose = 'Redis';
          else if (context.toLowerCase().includes('postgres')) purpose = 'PostgreSQL';
          else if (context.toLowerCase().includes('mongo')) purpose = 'MongoDB';
          else if (context.toLowerCase().includes('dev')) purpose = 'Development Server';
          else if (context.toLowerCase().includes('proxy')) purpose = 'Proxy';
          else if (context.toLowerCase().includes('grpc')) purpose = 'gRPC Server';

          portInfos.push({ port, purpose, source });
        }
      }
    }
  }

  return portInfos;
}

function extractURLs(content: string): string[] {
  const urls = new Set<string>();

  for (const pattern of URL_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const url = match[1] || match[0];
      if (url && url.startsWith('http')) {
        // Filter out common placeholder URLs
        if (!url.includes('example.com') &&
            !url.includes('localhost') &&
            !url.includes('127.0.0.1') &&
            !url.includes('{{') &&
            !url.includes('${')) {
          urls.add(url);
        }
      }
    }
  }

  return Array.from(urls);
}

async function scanProject(projectPath: string, projectName: string): Promise<ProjectInfo> {
  const ports: PortInfo[] = [];
  const urls: string[] = [];

  // Files to scan
  const filesToScan = [
    'package.json',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.env',
    '.env.local',
    '.env.development',
    'README.md',
    'config.js',
    'config.ts',
    'vite.config.ts',
    'vite.config.js',
    'next.config.js',
    'nuxt.config.ts',
    'astro.config.mjs',
  ];

  for (const file of filesToScan) {
    const filePath = join(projectPath, file);
    const content = await readFileIfExists(filePath);
    if (content) {
      ports.push(...extractPorts(content, file));
      urls.push(...extractURLs(content));
    }
  }

  // Scan common config directories
  const configDirs = ['config', 'src/config', 'server/config'];
  for (const dir of configDirs) {
    const dirPath = join(projectPath, dir);
    if (await fileExists(dirPath)) {
      try {
        const files = await readdir(dirPath);
        for (const file of files) {
          if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json')) {
            const filePath = join(dirPath, file);
            const content = await readFileIfExists(filePath);
            if (content) {
              ports.push(...extractPorts(content, `${dir}/${file}`));
              urls.push(...extractURLs(content));
            }
          }
        }
      } catch {}
    }
  }

  // Remove duplicates
  const uniquePorts = Array.from(
    new Map(ports.map(p => [p.port, p])).values()
  );

  return {
    repo: projectName,
    path: projectPath,
    ports: uniquePorts,
    urls: Array.from(new Set(urls)),
  };
}

export async function scanAllProjects(basePaths: string[]): Promise<ProjectInfo[]> {
  const projects: ProjectInfo[] = [];

  for (const basePath of basePaths) {
    try {
      const entries = await readdir(basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const projectPath = join(basePath, entry.name);
          const projectInfo = await scanProject(projectPath, entry.name);
          projects.push(projectInfo);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${basePath}:`, error);
    }
  }

  return projects;
}
