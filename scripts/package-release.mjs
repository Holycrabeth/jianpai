#!/usr/bin/env node
import { mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'dist');
const outFile = resolve(outDir, 'jianpai-latest.tar.gz');
await mkdir(outDir, { recursive: true });
await rm(outFile, { force: true });

const args = [
  '-czf', outFile,
  '--exclude', './.git',
  '--exclude', './build',
  '--exclude', './node_modules',
  '--exclude', './dist',
  '--exclude', './.DS_Store',
  '--exclude', './*.log',
  '-C', root,
  '.',
];
const result = spawnSync('tar', args, { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`已生成：${outFile}`);
console.log('可上传到 GitHub Release，下载地址将是：');
console.log('https://github.com/Holycrabeth/jianpai/releases/latest/download/jianpai-latest.tar.gz');
