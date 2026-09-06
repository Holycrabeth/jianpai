#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'build/pi/dist/cli.js');
if (!existsSync(entry) || !existsSync(join(root, 'build/translation-report.json'))) {
  console.error('简派尚未构建。请在简派目录运行：npm ci --ignore-scripts && npm run build');
  process.exit(1);
}
// Preserve the caller's working directory, argv and terminal streams.
// A separate profile prevents experiments from changing ~/.pi/agent.
const child = spawn(process.execPath, [entry, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    JIANPAI_CODING_AGENT_DIR: process.env.JIANPAI_CODING_AGENT_DIR || join(homedir(), '.jianpai/agent'),
    PI_PACKAGE_DIR: join(root, 'build/pi'),
    PI_SKIP_VERSION_CHECK: process.env.PI_SKIP_VERSION_CHECK ?? '1',
    PI_TELEMETRY: process.env.PI_TELEMETRY ?? '0',
  },
});
// SIGINT is delivered by the terminal to the whole process group. Let Pi handle Ctrl+C.
const ignoreInterrupt = () => {};
process.on('SIGINT', ignoreInterrupt);
for (const signal of ['SIGTERM', 'SIGHUP']) process.on(signal, () => child.kill(signal));
child.on('error', error => {
  console.error(`无法启动简派：${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.removeListener('SIGINT', ignoreInterrupt);
  process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1);
});
