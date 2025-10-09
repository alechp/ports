import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { existsSync, writeFileSync } from 'fs';

const execAsync = promisify(exec);

interface IndexOptions {
  output?: string;
}

export async function indexCommand(directory: string, options: IndexOptions) {
  const absPath = resolve(directory);

  if (!existsSync(absPath)) {
    console.error(`❌ Directory not found: ${absPath}`);
    process.exit(1);
  }

  console.log(`🔍 Indexing directory: ${absPath}\n`);

  try {
    // Check if Claude Code CLI is available
    try {
      await execAsync('which claude');
    } catch {
      console.error('❌ Claude Code CLI not found!');
      console.error('Please install Claude Code CLI first.');
      console.error('Visit: https://github.com/anthropics/claude-code');
      process.exit(1);
    }

    console.log('📝 Using Claude Code CLI to search for ports and URLs...\n');

    // Use Claude Code CLI to search for ports and URLs
    const prompt = `Search through all files in this directory (${absPath}) and find:
1. All port numbers being used (look for PORT=, listen on port, localhost:, 127.0.0.1:, etc.)
2. All URLs (http://, https://)

For each port found, identify:
- The port number
- The file where it was found
- The purpose (API server, web server, database, redis, etc.)

For each URL found, identify:
- The URL
- The file where it was found

Format the output as JSON:
{
  "ports": [
    {
      "port": "3000",
      "file": "path/to/file",
      "purpose": "API Server",
      "context": "line of code where found"
    }
  ],
  "urls": [
    {
      "url": "https://example.com",
      "file": "path/to/file"
    }
  ]
}`;

    const { stdout, stderr } = await execAsync(
      `cd "${absPath}" && claude --prompt "${prompt.replace(/"/g, '\\"')}"`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );

    if (stderr) {
      console.error('⚠️  Warnings from Claude Code CLI:', stderr);
    }

    console.log('📊 Results:\n');
    console.log(stdout);

    if (options.output) {
      const outputPath = resolve(options.output);
      writeFileSync(outputPath, stdout);
      console.log(`\n✓ Results saved to: ${outputPath}`);
    }

    console.log('\n✓ Indexing complete!');
  } catch (error) {
    console.error('❌ Indexing failed:', error instanceof Error ? error.message : error);

    // Fallback: Use our built-in scanner
    console.log('\n📝 Falling back to built-in scanner...\n');

    try {
      const { scanAllProjects } = require('../scanner');
      const projects = await scanAllProjects([absPath]);

      const result = {
        directory: absPath,
        projects: projects.map((p) => ({
          name: p.repo,
          path: p.path,
          ports: p.ports,
          urls: p.urls,
        })),
      };

      const output = JSON.stringify(result, null, 2);
      console.log(output);

      if (options.output) {
        const outputPath = resolve(options.output);
        writeFileSync(outputPath, output);
        console.log(`\n✓ Results saved to: ${outputPath}`);
      }

      console.log('\n✓ Indexing complete!');
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError instanceof Error ? fallbackError.message : fallbackError);
      process.exit(1);
    }
  }
}
