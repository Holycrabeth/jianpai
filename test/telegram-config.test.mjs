import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, cp, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { loadTelegramEnvironment } from '../scripts/telegram-config.mjs';

const config = 'export JIANPAI_TELEGRAM_BOT_TOKEN="test-token"\nexport JIANPAI_TELEGRAM_CHAT_ID="test-chat"\n';
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'jianpai-telegram-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await writeFile(join(dir, 'telegram.env'), config, { mode: 0o600 });
  return dir;
}

test('Telegram 配置：无需 shell export 即可读取安装器保存的配置，不污染父进程', async t => {
  const dir = await fixture(t);
  const environment = { PATH: '/test' };
  const result = await loadTelegramEnvironment(dir, environment);
  assert.equal(result.JIANPAI_TELEGRAM_BOT_TOKEN, 'test-token');
  assert.equal(result.JIANPAI_TELEGRAM_CHAT_ID, 'test-chat');
  assert.deepEqual(environment, { PATH: '/test' });
});

test('Telegram 配置：显式变量及通用别名优先，关闭或缺少文件时不加载', async t => {
  const dir = await fixture(t);
  const explicit = { JIANPAI_TELEGRAM_BOT_TOKEN: 'override', TELEGRAM_CHAT_ID: 'alias-chat' };
  assert.deepEqual(await loadTelegramEnvironment(dir, explicit), explicit);
  assert.deepEqual(await loadTelegramEnvironment(dir, { JIANPAI_TELEGRAM_NOTIFY: '0' }), { JIANPAI_TELEGRAM_NOTIFY: '0' });
  assert.deepEqual(await loadTelegramEnvironment(join(dir, 'missing'), {}), {});
});

test('Telegram 配置：只读允许字段，不执行 shell 命令或导入 NODE_OPTIONS', async t => {
  const dir = await fixture(t);
  await writeFile(join(dir, 'telegram.env'), config + 'NODE_OPTIONS="--invalid"\nIGNORED=$(exit 99)\n');
  const result = await loadTelegramEnvironment(dir, {});
  assert.deepEqual(Object.keys(result).sort(), ['JIANPAI_TELEGRAM_BOT_TOKEN', 'JIANPAI_TELEGRAM_CHAT_ID']);
  await rm(join(dir, 'telegram.env'));
  await mkdir(join(dir, 'telegram.env'));
  await assert.rejects(loadTelegramEnvironment(dir, {}), /无法读取 Telegram 配置/);
});

test('启动器集成：自定义配置目录中的 Telegram 设置传给子进程，保留 cwd 和参数', async t => {
  const dir = await fixture(t);
  for (const folder of ['bin', 'scripts', 'models', 'build/pi/dist', 'extensions']) await mkdir(join(dir, folder), { recursive: true });
  for (const file of ['bin/jianpai.mjs', 'scripts/merge-models.mjs', 'scripts/telegram-config.mjs', 'models/jianpai.models.json']) await cp(file, join(dir, file));
  await writeFile(join(dir, 'extensions/telegram-done.ts'), '');
  await writeFile(join(dir, 'build/translation-report.json'), '{}');
  await writeFile(join(dir, 'build/pi/dist/cli.js'), 'console.log(JSON.stringify({token:process.env.JIANPAI_TELEGRAM_BOT_TOKEN,chat:process.env.JIANPAI_TELEGRAM_CHAT_ID,cwd:process.cwd(),args:process.argv.slice(2)}))');
  const result = spawnSync(process.execPath, [join(dir, 'bin/jianpai.mjs'), '--version'], {
    cwd: tmpdir(), encoding: 'utf8', timeout: 10000,
    env: { PATH: process.env.PATH, HOME: dir, JIANPAI_CODING_AGENT_DIR: dir },
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.token, 'test-token');
  assert.equal(output.chat, 'test-chat');
  assert.ok(output.args.includes(join(await realpath(dir), 'extensions/telegram-done.ts')));
  assert.equal(output.cwd, await realpath(tmpdir()));
  assert.equal(output.args.at(-1), '--version');
});

test('完成通知回归：文件配置加载后 agent_settled 发送一次，失败可见（模拟网络）', async t => {
  const dir = await fixture(t);
  const original = process.env;
  process.env = await loadTelegramEnvironment(dir, {});
  t.after(() => { process.env = original; });
  const require = createRequire(resolve('node_modules/@earendil-works/pi-coding-agent/package.json'));
  const { createJiti } = require('jiti');
  const extension = await createJiti(import.meta.url).import(resolve('extensions/telegram-done.ts'), { default: true });
  const handlers = new Map();
  const warnings = [];
  const requests = [];
  extension({ on: (event, handler) => handlers.set(event, handler), getSessionName: () => '测试会话' });
  const ctx = { cwd: '/test', ui: { notify: text => warnings.push(text) } };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok: true };
  });
  await handlers.get('agent_settled')({}, ctx);
  assert.equal(requests.length, 0);
  await handlers.get('before_agent_start')({ prompt: '测试 <通知>' });
  await handlers.get('agent_settled')({}, ctx);
  await handlers.get('agent_settled')({}, ctx);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.telegram.org/bottest-token/sendMessage');
  assert.equal(requests[0].body.chat_id, 'test-chat');
  assert.ok(requests[0].body.text.includes('简派干完了'));
  assert.ok(requests[0].body.text.includes('&lt;通知&gt;'));
  assert.equal(warnings.length, 0);
  globalThis.fetch.mock.mockImplementation(async () => { throw new Error('模拟网络错误'); });
  await handlers.get('before_agent_start')({ prompt: '失败测试' });
  await handlers.get('agent_settled')({}, ctx);
  assert.ok(warnings[0].includes('模拟网络错误'));
});
