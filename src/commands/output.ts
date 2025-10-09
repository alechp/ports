import { resolve } from 'path';
import { scanAllProjects } from '../scanner';

const YAPTURE_PATH = resolve(process.cwd(), '../../yapture');
const STUDIO_PATH = resolve(process.cwd(), '../../studio');

interface OutputOptions {
  format: 'text' | 'json' | 'markdown';
}

export async function outputCommand(options: OutputOptions) {
  console.log('🔍 Scanning projects for ports...\n');

  try {
    const projects = await scanAllProjects([YAPTURE_PATH, STUDIO_PATH]);

    // Collect all unique ports
    const portMap = new Map<string, { purpose: string; projects: string[] }>();

    projects.forEach((project) => {
      project.ports.forEach((portInfo) => {
        const port = portInfo.port;
        if (!portMap.has(port)) {
          portMap.set(port, { purpose: portInfo.purpose, projects: [] });
        }
        portMap.get(port)!.projects.push(project.repo);
      });
    });

    // Sort ports numerically
    const sortedPorts = Array.from(portMap.entries()).sort(
      ([a], [b]) => parseInt(a) - parseInt(b)
    );

    // Output based on format
    if (options.format === 'json') {
      const output = {
        totalProjects: projects.length,
        totalPorts: sortedPorts.length,
        ports: sortedPorts.map(([port, info]) => ({
          port: parseInt(port),
          purpose: info.purpose,
          usedBy: info.projects,
        })),
      };
      console.log(JSON.stringify(output, null, 2));
    } else if (options.format === 'markdown') {
      console.log('# Common Local Ports - Avoid These to Prevent Conflicts\n');
      console.log(`**Total Projects Scanned:** ${projects.length}`);
      console.log(`**Total Unique Ports:** ${sortedPorts.length}\n`);
      console.log('## Ports in Use\n');
      console.log('| Port | Purpose | Used By |');
      console.log('|------|---------|---------|');
      sortedPorts.forEach(([port, info]) => {
        console.log(
          `| ${port} | ${info.purpose} | ${info.projects.join(', ')} |`
        );
      });
      console.log('\n## Quick Reference for New Projects\n');
      console.log('**Avoid these ports when creating new services:**\n');
      const portList = sortedPorts.map(([port]) => port).join(', ');
      console.log('```');
      console.log(portList);
      console.log('```');
    } else {
      // text format (default)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  COMMON LOCAL PORTS - AVOID THESE TO PREVENT CONFLICTS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`Total Projects Scanned: ${projects.length}`);
      console.log(`Total Unique Ports: ${sortedPorts.length}\n`);
      console.log('Ports in Use:\n');

      sortedPorts.forEach(([port, info]) => {
        console.log(
          `  Port ${port.padEnd(5)} - ${info.purpose.padEnd(20)} (${info.projects.join(', ')})`
        );
      });

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  QUICK REFERENCE FOR NEW PROJECTS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Avoid these ports when creating new services:\n');
      const portList = sortedPorts.map(([port]) => port).join(', ');
      console.log(`  ${portList}\n`);
    }

    console.log('\n✓ Done!');
  } catch (error) {
    console.error('❌ Failed to generate output:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
