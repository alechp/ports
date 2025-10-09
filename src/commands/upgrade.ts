import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

const GITHUB_REPO = 'alechp/ports';
const INSTALL_PATH = process.env.HOME + '/.local/bin/ports';

interface GitHubRelease {
  tag_name: string;
  name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'ports-cli',
      },
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          resolve(release);
        } catch (error) {
          reject(new Error('Failed to parse release data'));
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        if (res.headers.location) {
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
      }

      const file = require('fs').createWriteStream(dest);
      res.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err: Error) => {
        require('fs').unlinkSync(dest);
        reject(err);
      });
    }).on('error', reject);
  });
}

export async function upgradeCommand() {
  console.log('🔍 Checking for updates...');

  try {
    const packageJson = require('../../package.json');
    const currentVersion = packageJson.version;

    const release = await fetchLatestRelease();
    const latestVersion = release.tag_name.replace('v', '');

    console.log(`Current version: ${currentVersion}`);
    console.log(`Latest version: ${latestVersion}`);

    if (currentVersion === latestVersion) {
      console.log('✓ You are already on the latest version!');
      return;
    }

    console.log(`\n📦 Upgrading from v${currentVersion} to v${latestVersion}...`);

    // For now, we'll use bun to reinstall from git
    // In a real scenario, we'd download the binary from GitHub releases
    console.log('Installing latest version...');

    await execAsync(`bun install -g github:${GITHUB_REPO}#v${latestVersion}`);

    console.log(`\n✓ Successfully upgraded to v${latestVersion}!`);
    console.log('Run "ports" to use the latest version.');
  } catch (error) {
    console.error('❌ Upgrade failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
