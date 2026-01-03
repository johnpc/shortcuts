import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as plist from 'plist';
import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import type { ShortcutDefinition } from './types/shortcut';

dotenv.config();

const requiredEnvVars = [
  'HOME_ASSISTANT_API_URL',
  'S3_BUCKET',
  'S3_REGION',
  'S3_KEY_PREFIX',
  'FILE_HOST_URL',
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const shouldDeploy = process.argv.includes('--deploy');

async function loadShortcuts(): Promise<ShortcutDefinition[]> {
  const shortcutsDir = path.join(__dirname, 'shortcuts');
  const files = fs.readdirSync(shortcutsDir).filter((f) => f.endsWith('.ts'));

  const shortcuts: ShortcutDefinition[] = [];
  for (const file of files) {
    const module = await import(path.join(shortcutsDir, file));
    const exportedFunctions = Object.values(module).filter(
      (exp): exp is () => Promise<ShortcutDefinition> => typeof exp === 'function'
    );
    for (const fn of exportedFunctions) {
      shortcuts.push(await fn());
    }
  }

  return shortcuts;
}

async function buildShortcut(shortcut: ShortcutDefinition): Promise<void> {
  console.log(`Building ${shortcut.name}...`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const binaryPlist = plist.build(shortcut.data as any);
  const rawFilename = `${shortcut.filename}-raw.shortcut`;
  fs.writeFileSync(rawFilename, binaryPlist, 'binary');

  console.log(`✓ ${shortcut.name} created!`);

  if (shouldDeploy) {
    console.log(`\nSigning ${shortcut.name}...`);
    const signedFilename = `${shortcut.filename}.signed.shortcut`;
    execSync(
      `shortcuts sign --mode anyone --input ${rawFilename} --output ${signedFilename} 2>/dev/null`
    );

    console.log('Uploading to S3...');
    const hash = crypto.randomBytes(3).toString('hex');
    const uploadFilename = `${hash}-${shortcut.filename}.shortcut`;
    const s3Key = `${process.env.S3_KEY_PREFIX}/${uploadFilename}`;

    const s3Client = new S3Client({ region: process.env.S3_REGION });
    const fileContent = fs.readFileSync(signedFilename);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/octet-stream',
      })
    );

    const url = `${process.env.FILE_HOST_URL}/${uploadFilename}`;
    console.log(`✓ Deployed to: ${url}`);

    // Send SMS notification if configured
    if (process.env.TEXTBELT_API_KEY && process.env.TEXTBELT_PHONE) {
      try {
        const response = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: process.env.TEXTBELT_PHONE,
            message: `${shortcut.name} deployed: ${url}`,
            key: process.env.TEXTBELT_API_KEY,
          }),
        });
        const result = await response.json();
        if (result.success) {
          console.log('✓ SMS sent');
        } else {
          console.log(`⚠ SMS failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`⚠ SMS error: ${error}`);
      }
    }

    console.log('');
  }
}

async function main() {
  const shortcuts = await loadShortcuts();

  for (const shortcut of shortcuts) {
    await buildShortcut(shortcut);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
