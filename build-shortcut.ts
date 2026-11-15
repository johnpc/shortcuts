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

    // Send iMessage notification
    try {
      await sendIMessage(url);
      console.log('✓ iMessage sent');
    } catch (error) {
      console.log(`⚠ iMessage error: ${error}`);
    }

    console.log('');
  }
}

/**
 * Texts the deploy URL. Prefers the BlueBubbles server (works from SSH/CI, where
 * AppleScript silently drops messages); falls back to AppleScript when unset.
 */
async function sendIMessage(text: string): Promise<void> {
  const phone = process.env.IMESSAGE_PHONE;
  if (!phone) throw new Error('IMESSAGE_PHONE not set');
  const base = process.env.BLUEBUBBLES_URL;
  const password = process.env.BLUEBUBBLES_PASSWORD;
  if (base && password) {
    const res = await fetch(
      `${base}/api/v1/message/text?password=${encodeURIComponent(password)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatGuid: `iMessage;-;${phone}`,
          tempGuid: crypto.randomUUID(),
          message: text,
          method: 'apple-script',
        }),
      }
    );
    if (!res.ok) throw new Error(`BlueBubbles ${res.status}: ${await res.text()}`);
    await sendTextBeltPing(phone);
    return;
  }
  execSync(`osascript -e 'tell application "Messages" to send "${text}" to buddy "${phone}"'`);
}

/**
 * The Mac mini's Messages is signed in as the recipient, so the iMessage lands
 * silently in their self-thread. A plain SMS via TextBelt makes the phone buzz
 * (no URL — unverified TextBelt keys cannot send links).
 */
async function sendTextBeltPing(phone: string): Promise<void> {
  const key = process.env.TEXTBELT_API_KEY;
  if (!key) return;
  const body = new URLSearchParams({
    phone,
    message: 'New shortcut deployed - link is in your Messages thread with yourself.',
    key,
  });
  const res = await fetch('https://textbelt.com/text', { method: 'POST', body });
  const json = (await res.json()) as { success: boolean; error?: string };
  if (!json.success) throw new Error(`TextBelt: ${json.error ?? 'unknown error'}`);
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
