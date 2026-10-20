import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['--check', join(root, 'src/app.js')], { stdio: 'inherit' });
const html = await readFile(join(root, 'src/index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const navigation = html.match(/<nav>([\s\S]*?)<\/nav>/)?.[1] ?? '';
for (const [, id] of navigation.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(id)) throw new Error(`Missing navigation target: ${id}`);
}
await rm(join(root, 'dist'), { recursive: true, force: true });
await mkdir(join(root, 'dist'), { recursive: true });
await cp(join(root, 'src'), join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/.nojekyll'), '');
console.log('Built dist/ and checked JavaScript and navigation.');
