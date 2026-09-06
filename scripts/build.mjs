import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { textNodes, applyCatalog } from './catalog.mjs';
import { common, commonTemplates, files } from '../locales/zh-CN.mjs';
import interactive, { hotkeyPhrases } from '../locales/interactive.zh-CN.mjs';
import { files as cliFiles, helpPhrases } from '../locales/cli.zh-CN.mjs';
import { patches, applyPatches } from '../locales/patches.mjs';
import { files as packageFiles, phrases as packagePhrases } from '../locales/packages.zh-CN.mjs';
import { files as themeFiles } from '../locales/theme.zh-CN.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const upstream = join(root, 'node_modules/@earendil-works/pi-coding-agent');
export const output = join(root, 'build/pi');
export const version = '0.85.0';
const specs = { ...files, ...cliFiles, ...packageFiles, ...themeFiles, 'dist/modes/interactive/interactive-mode.js': interactive };
export const digest = text => createHash('sha256').update(text).digest('hex');

export async function compile() {
  const pkg = JSON.parse(await readFile(join(upstream, 'package.json'), 'utf8'));
  if (pkg.version !== version) throw new Error(`仅支持 Pi ${version}，实际为 ${pkg.version}`);
  const results = {};
  for (const file of new Set([...Object.keys(specs), ...Object.keys(patches)])) {
    const original = await readFile(join(upstream, file), 'utf8');
    const source = applyPatches(original, patches[file], file);
    const spec = specs[file] ?? {};
    const strings = { ...common, ...spec.strings };
    const templates = { ...commonTemplates, ...spec.templates };
    const entries = new Map();
    for (const node of textNodes(source)) {
      const map = node.kind === 'string' ? strings : templates;
      let zh = Object.hasOwn(map, node.text) ? map[node.text] : node.text;
      if (node.kind === 'template') {
        const phrases = file === 'dist/cli/args.js' && node.start > source.indexOf('export function printHelp(')
          ? helpPhrases : file === 'dist/modes/interactive/interactive-mode.js' && node.text.includes('|') ? hotkeyPhrases
            : ['dist/package-manager-cli.js', 'dist/cli/auth-command.js'].includes(file) ? packagePhrases : {};
        for (const [en, replacement] of Object.entries(phrases)) zh = zh.split(en).join(replacement);
      }
      if (zh === node.text) continue;
      const key = `${node.kind}:${node.text}`;
      if (entries.has(key)) entries.get(key).count++;
      else entries.set(key, { kind: node.kind, en: node.text, zh, count: 1 });
    }
    const catalog = [...entries.values()];
    results[file] = { sourceHash: digest(original), catalog, source: applyCatalog(source, catalog, file) };
  }
  return results;
}

export async function verifyUpstream(results) {
  const lock = JSON.parse(await readFile(join(root, 'locales/upstream-lock.json'), 'utf8'));
  if (lock.version !== version) throw new Error('上游版本锁不匹配');
  for (const [file, result] of Object.entries(results)) {
    if (lock.files[file] !== result.sourceHash) throw new Error(`上游文件变化，拒绝构建：${file}`);
  }
}

export async function build() {
  const results = await compile();
  await verifyUpstream(results);
  // This directory contains only generated artifacts. Never edit the installed Pi or global config.
  await rm(join(root, 'build'), { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(upstream, output, { recursive: true, verbatimSymlinks: true });
  for (const [file, result] of Object.entries(results)) {
    await writeFile(join(output, file), result.source);
    // Upstream source maps no longer match the translated build.
    await rm(join(output, file + '.map'), { force: true });
  }
  await cp(join(root, 'src/display-values.js'), join(output, 'dist/jianpai-locale.js'));
  await cp(join(root, 'THIRD_PARTY_LICENSES/Pi-MIT.txt'), join(output, 'LICENSE'));
  const pkg = JSON.parse(await readFile(join(output, 'package.json'), 'utf8'));
  pkg.piConfig = { ...pkg.piConfig, name: 'jianpai' };
  // Keep upstream package identity/version for dependency and extension compatibility.
  await writeFile(join(output, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  const report = {
    upstreamVersion: version,
    files: Object.keys(results).length,
    entries: Object.values(results).reduce((n, r) => n + r.catalog.length, 0),
    occurrences: Object.values(results).reduce((n, r) => n + r.catalog.reduce((n, e) => n + e.count, 0), 0),
    catalog: Object.fromEntries(Object.entries(results).map(([file, r]) => [file, r.catalog])),
  };
  await writeFile(join(root, 'build/translation-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`简派构建完成：Pi ${version}，${report.files} 个文件，${report.entries} 条文案（${report.occurrences} 处显示）。`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--record-upstream')) {
    const results = await compile();
    await writeFile(join(root, 'locales/upstream-lock.json'), JSON.stringify({ version, files: Object.fromEntries(Object.entries(results).map(([file, r]) => [file, r.sourceHash])) }, null, 2) + '\n');
    console.log('已记录上游文件指纹；升级前必须重新审核文案和补丁。');
  } else await build();
}
