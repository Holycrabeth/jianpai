#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { writeMergedModels } from '../scripts/merge-models.mjs';
import { loadTelegramEnvironment } from '../scripts/telegram-config.mjs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'build/pi/dist/cli.js');
const telegramDoneExtension = join(root, 'extensions/telegram-done.ts');
if (!existsSync(entry) || !existsSync(join(root, 'build/translation-report.json'))) {
  console.error('简派尚未构建。请在简派目录运行：npm ci --ignore-scripts && npm run build');
  process.exit(1);
}
const agentDir = process.env.JIANPAI_CODING_AGENT_DIR || join(homedir(), '.jianpai/agent');
const modelsPath = join(agentDir, 'models.json');
const mergedModelsPath = join(agentDir, 'generated/jianpai-models.json');
try {
  await writeMergedModels({ userPath: modelsPath, outputPath: mergedModelsPath });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
// Preserve the caller's working directory, argv and terminal streams.
// A separate profile prevents experiments from changing ~/.pi/agent.
const extraArgs = [];
if (process.env.JIANPAI_TELEGRAM_NOTIFY !== '0' && existsSync(telegramDoneExtension)) {
  extraArgs.push('--extension', telegramDoneExtension);
}

let notificationEnv;
try {
  notificationEnv = await loadTelegramEnvironment(agentDir);
} catch (error) {
  console.error(error.message);
  // A notification configuration failure must not prevent normal use of the agent.
  notificationEnv = process.env;
}

const child = spawn(process.execPath, [entry, ...extraArgs, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...notificationEnv,
    JIANPAI_CODING_AGENT_DIR: agentDir,
    JIANPAI_MODELS_PATH: mergedModelsPath,
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
