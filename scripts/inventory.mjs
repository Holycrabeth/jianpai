import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { textNodes } from './catalog.mjs';

const root = 'node_modules/@earendil-works/pi-coding-agent';
export async function filesIn(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else files.push(path);
  }
  return files;
}
const paths = [
  ...await filesIn(join(root, 'dist/modes/interactive')),
  ...await filesIn(join(root, 'dist/cli')),
  ...await filesIn(join(root, 'dist/core/tools/renderers')),
  join(root, 'dist/core/tools/render-utils.js'),
  join(root, 'dist/core/slash-commands.js'),
  join(root, 'dist/main.js'),
  join(root, 'dist/package-manager-cli.js'),
  join(root, 'dist/core/package-manager.js'),
  ...await filesIn(join(root, 'node_modules/@earendil-works/pi-tui/dist/components')),
];
await mkdir('.local', { recursive: true });
let output = '';
for (const path of paths.filter(path => path.endsWith('.js'))) {
  const source = await readFile(path, 'utf8');
  const unique = new Map();
  for (const node of textNodes(source)) {
    if (!/[a-zA-Z]/.test(node.text) || node.text.startsWith('./') || node.text.startsWith('../') || node.text.startsWith('@')) continue;
    const key = `${node.kind}:${node.text}`;
    if (unique.has(key)) unique.get(key).count++;
    else unique.set(key, { kind: node.kind, en: node.text, count: 1 });
  }
  output += `\n### ${relative(root, path)}\n`;
  for (const entry of unique.values()) output += JSON.stringify(entry) + '\n';
}
await writeFile('.local/inventory.txt', output);
console.log('文案清单：.local/inventory.txt');
