import { scanAllProjects } from './src/scanner';
import { resolve } from 'path';

const YAPTURE_PATH = resolve(__dirname, '../../yapture');
const STUDIO_PATH = resolve(__dirname, '../../studio');

console.log('Yapture path:', YAPTURE_PATH);
console.log('Studio path:', STUDIO_PATH);
console.log('\nScanning projects...\n');

const projects = await scanAllProjects([YAPTURE_PATH, STUDIO_PATH]);

console.log(`Found ${projects.length} projects\n`);

for (const project of projects) {
  console.log(`\n📁 ${project.repo}`);
  console.log(`   Path: ${project.path}`);
  console.log(`   Ports: ${project.ports.length}`);
  for (const port of project.ports) {
    console.log(`     • ${port.port} - ${port.purpose} (${port.source})`);
  }
  console.log(`   URLs: ${project.urls.length}`);
  for (const url of project.urls) {
    console.log(`     • ${url}`);
  }
}
