import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { spawnSync } from 'node:child_process';
import { applyCatalog } from '../scripts/catalog.mjs';
import { initTheme, theme, getEditorTheme } from '../build/pi/dist/modes/interactive/theme/theme.js';
import { writeRenderers } from '../build/pi/dist/core/tools/renderers/write.js';
import { readRenderers } from '../build/pi/dist/core/tools/renderers/read.js';
import { editRenderers } from '../build/pi/dist/core/tools/renderers/edit.js';
import { createShellRenderers } from '../build/pi/dist/core/tools/renderers/bash.js';
import { SettingsSelectorComponent } from '../build/pi/dist/modes/interactive/components/settings-selector.js';
import { ThinkingSelectorComponent } from '../build/pi/dist/modes/interactive/components/thinking-selector.js';
import { LoginDialogComponent } from '../build/pi/dist/modes/interactive/components/login-dialog.js';
import { AssistantMessageComponent } from '../build/pi/dist/modes/interactive/components/assistant-message.js';
import { createWriteToolDefinition } from '../build/pi/dist/core/tools/write.js';
import { createReadToolDefinition } from '../build/pi/dist/core/tools/read.js';
import { createEditToolDefinition } from '../build/pi/dist/core/tools/edit.js';
import { createBashToolDefinition } from '../build/pi/dist/core/tools/bash.js';
import { getProjectTrustOptions } from '../build/pi/dist/core/trust-manager.js';
import { BUILTIN_SLASH_COMMANDS } from '../build/pi/dist/core/slash-commands.js';
import { Editor, SettingsList, visibleWidth } from '../build/pi/node_modules/@earendil-works/pi-tui/dist/index.js';
import { zhThinking, zhSettingValue } from '../src/display-values.js';

initTheme('dark');
const clean = component => stripVTControlCharacters(component.render(100).join('\n'));
const context = (args = {}, extra = {}) => ({ args, state: {}, cwd: process.cwd(), expanded: false, argsComplete: false, isPartial: true, showImages: false, isError: false, executionStarted: false, invalidate() {}, ...extra });

test('文案替换严格匹配，保留模板表达式并拒绝上游变化', () => {
  const code = 'const x = `write ${path}`; const name = "write";';
  const translated = applyCatalog(code, [{ kind: 'template', en: 'write ', zh: '撰写 ', count: 1 }], 'test');
  assert.equal(translated, 'const x = `撰写 ${path}`; const name = "write";');
  assert.throws(() => applyCatalog(code, [{ kind: 'string', en: 'read', zh: '读取', count: 1 }], 'test'), /文案匹配数变化/);
});

test('四个工具显示中文标题，路径和命令原文不变', () => {
  const path = 'docs/architecture.md';
  for (const [renderer, expected] of [[writeRenderers, '撰写'], [readRenderers, '读取'], [editRenderers, '修改']]) {
    const args = { path, content: 'const write = "read"; // bash' };
    const rendered = clean(renderer.renderCall(args, theme, context(args)));
    assert.ok(rendered.includes(expected + ' ' + path), rendered);
    if (renderer === writeRenderers) assert.ok(rendered.includes('const write = "read"; // bash'));
  }
  const command = 'printf "write docs/architecture.md"';
  const args = { command, timeout: 3 };
  const text = clean(createShellRenderers('$').renderCall(args, theme, context(args)));
  assert.ok(text.includes('执行命令 $ ' + command));
  assert.ok(text.includes('超时限制 3 秒'));
});

test('长日志可展开，原始内容和截断路径不被翻译', () => {
  const renderer = createShellRenderers('$');
  const result = { content: [{ type: 'text', text: Array.from({ length: 40 }, (_, i) => `write line ${i}`).join('\n') }], details: { fullOutputPath: '/tmp/原始日志.txt' } };
  const original = JSON.stringify(result);
  const collapsed = clean(renderer.renderResult(result, { expanded: false, isPartial: false }, theme, context()));
  assert.ok(collapsed.includes('行较早输出'));
  assert.ok(collapsed.includes('/tmp/原始日志.txt'));
  const expanded = clean(renderer.renderResult(result, { expanded: true, isPartial: false }, theme, context()));
  assert.ok(expanded.includes('write line 0'));
  assert.ok(expanded.includes('write line 39'));
  assert.equal(JSON.stringify(result), original);
});

test('读取错误保持可见，不将原始报错变为成功', () => {
  const args = { path: '不存在.txt' };
  const result = { content: [{ type: 'text', text: 'ENOENT: file not found 不存在.txt' }] };
  const text = clean(readRenderers.renderResult(result, { expanded: false, isPartial: false }, theme, context(args, { isError: true })));
  assert.ok(text.includes('ENOENT: file not found 不存在.txt'));
});

test('真实文件撰写、读取、修改以及失败 / 取消语义保持原样', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'jianpai-tools-'));
  try {
    const write = createWriteToolDefinition(cwd);
    const read = createReadToolDefinition(cwd);
    const edit = createEditToolDefinition(cwd);
    assert.deepEqual([write.name, read.name, edit.name], ['write', 'read', 'edit']);
    const result = await write.execute('write-1', { path: '中文目录/测试.txt', content: 'write read bash\n原始文本' });
    assert.equal(result.content[0].text, 'Successfully wrote to 中文目录/测试.txt');
    const readResult = await read.execute('read-1', { path: '中文目录/测试.txt' });
    assert.ok(readResult.content[0].text.includes('write read bash'));
    const edited = await edit.execute('edit-1', { path: '中文目录/测试.txt', edits: [{ oldText: '原始文本', newText: '修改后的文本' }] });
    assert.ok(edited.details.diff.includes('修改后的文本'));
    assert.equal(await readFile(join(cwd, '中文目录/测试.txt'), 'utf8'), 'write read bash\n修改后的文本');
    await assert.rejects(read.execute('missing', { path: '不存在.txt' }));
    await assert.rejects(write.execute('cancel', { path: '取消.txt', content: 'no' }, AbortSignal.abort()), /Operation aborted/);
    await assert.rejects(readFile(join(cwd, '取消.txt')), /ENOENT/);
    const bash = createBashToolDefinition(cwd);
    const shellResult = await bash.execute('shell', { command: 'printf "write original log"' });
    assert.equal(shellResult.content[0].text, 'write original log');
    const failure = await bash.execute('failure', { command: 'exit 7' }).catch(error => error);
    assert.ok(JSON.stringify(failure).includes('7') || failure.message?.includes('7'));
  } finally { await rm(cwd, { recursive: true, force: true }); }
});

const settings = {
  warnings: {}, modelThinkingLevels: {}, availableDefaultModels: [], availableThemes: ['dark', 'light'],
  currentTheme: 'dark', thinkingLevel: 'medium', autoCompact: true, steeringMode: 'one-at-a-time', followUpMode: 'all',
  transport: 'auto', httpIdleTimeoutMs: 300000, defaultProjectTrust: 'ask', doubleEscapeAction: 'tree', treeFilterMode: 'default',
  tuiMode: 'regular', fullscreenExitOutput: 'transcript', fullscreenScrollbar: 'auto', mermaidRenderingMode: 'off',
};

test('设置显示开关中文，但保存的值仍为布尔值 / 英文枚举', () => {
  let changed;
  const component = new SettingsSelectorComponent(settings, { onAutoCompactChange: value => { changed = value; }, onCancel() {} });
  const text = clean(component);
  assert.ok(text.includes('自动压缩上下文'));
  assert.ok(text.includes('开启'));
  component.getSettingsList().handleInput('\r');
  assert.equal(changed, false);
  assert.ok(clean(component).includes('关闭'));
  assert.equal(zhSettingValue('tui-mode', 'fullscreen'), '全屏');
  assert.equal(zhThinking('high'), '深入');
});

test('不擅自翻译第三方设置值和自定义主题名', () => {
  assert.equal(zhSettingValue('third-party-tool', 'write'), 'write');
  assert.equal(zhSettingValue('theme', 'my-theme'), 'my-theme');
  const identity = text => text;
  const list = new SettingsList([{ id: 'custom', label: 'Custom', currentValue: 'true', values: ['true', 'false'] }], 10,
    { label: identity, value: identity, hint: identity, description: identity, cursor: '> ' }, () => {}, () => {});
  assert.ok(clean(list).includes('true'));
});

test('思考选项显示中文，选择回调仍返回原始枚举', () => {
  let selected;
  const component = new ThinkingSelectorComponent('high', ['off', 'low', 'high'], value => { selected = value; }, () => {});
  assert.ok(clean(component).includes('深入'));
  component.handleInput('\r');
  assert.equal(selected, 'high');
});

test('中文组件在 24 / 40 / 80 / 120 列内正常排版', () => {
  const args = { path: '中文目录/architecture.md', content: '内容'.repeat(100) };
  const components = [
    new SettingsSelectorComponent(settings, { onCancel() {} }),
    new ThinkingSelectorComponent('high', ['off', 'low', 'high'], () => {}, () => {}),
    writeRenderers.renderCall(args, theme, context(args)),
  ];
  for (const width of [24, 40, 80, 120]) {
    for (const component of components) {
      for (const line of component.render(width)) assert.ok(visibleWidth(line) <= width, `${width} 列溢出：${stripVTControlCharacters(line)}`);
    }
  }
});

test('中文命令说明不改变命令名；信任选择不改变布尔值和路径', () => {
  assert.ok(BUILTIN_SLASH_COMMANDS.some(command => command.name === 'settings' && command.description === '打开设置菜单'));
  const options = getProjectTrustOptions(process.cwd(), { includeSessionOnly: true });
  assert.equal(options[0].label, '信任');
  assert.equal(options[0].trusted, true);
  assert.equal(options.at(-1).trusted, false);
  assert.equal(options[0].updates[0].path, realpathSync(process.cwd()));
});

test('取消登录的内部信号保持原样，不误报为认证失败', async () => {
  let completed;
  const dialog = new LoginDialogComponent({ requestRender() {} }, 'test-provider', (ok, message) => { completed = { ok, message }; });
  const pending = dialog.showManualInput('输入验证码');
  const rejected = assert.rejects(pending, /Login cancelled/);
  dialog.cancel();
  await rejected;
  assert.equal(dialog.signal.aborted, true);
  assert.deepEqual(completed, { ok: false, message: 'Login cancelled' });
  assert.ok(clean(dialog).includes('登录 test-provider'));
});

test('长粘贴标记显示中文，提交时准确恢复原文，删除为完整标记', () => {
  for (const content of [Array.from({ length: 30 }, (_, i) => `write 第 ${i} 行`).join('\n'), 'read '.repeat(500)]) {
    const editor = new Editor({ terminal: { rows: 30 }, requestRender() {} }, getEditorTheme());
    editor.handleInput('\x1b[200~' + content + '\x1b[201~');
    assert.ok(editor.getText().startsWith('[粘贴 #1 '), editor.getText());
    assert.equal(editor.getExpandedText(), content);
    for (const width of [24, 40, 80]) {
      for (const line of editor.render(width)) assert.ok(visibleWidth(line) <= width);
    }
    editor.handleInput('\x7f');
    assert.equal(editor.getText(), '');
    assert.equal(editor.getExpandedText(), '');
  }
});

test('AI 正文不会被全文替换', () => {
  const component = new AssistantMessageComponent({ role: 'assistant', content: [{ type: 'text', text: 'write docs/architecture.md and read README.md' }], stopReason: 'stop' });
  assert.ok(clean(component).includes('write docs/architecture.md and read README.md'));
});

test('安装分发入口：保留英文命令并提供中文命令，安装脚本语法有效', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(pkg.bin.jianpai, 'bin/jianpai.mjs');
  assert.equal(pkg.bin['简派'], 'bin/jianpai.mjs');
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
  assert.equal(lock.packages[''].bin.jianpai, 'bin/jianpai.mjs');
  assert.equal(lock.packages[''].bin['简派'], 'bin/jianpai.mjs');
  assert.equal(spawnSync('bash', ['-n', 'scripts/install.sh']).status, 0);
});

test('独立启动器：中文帮助、原有选项、版本，可从其他目录启动', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'jianpai-profile-'));
  try {
    const launcher = join(process.cwd(), 'bin/jianpai.mjs');
    const run = args => spawnSync(process.execPath, [launcher, ...args], {
      cwd: tmpdir(), encoding: 'utf8', timeout: 20000,
      env: { ...process.env, JIANPAI_CODING_AGENT_DIR: profile, PI_OFFLINE: '1' },
    });
    const help = run(['--help']);
    assert.equal(help.status, 0, help.stderr);
    assert.ok(help.stdout.includes('用法：'));
    assert.ok(help.stdout.includes('--exclude-tools'));
    assert.ok(help.stdout.includes('撰写文件'));
    assert.equal(run(['--version']).stdout.trim(), '0.85.0');
    const invalid = run(['--not-a-real-option']);
    assert.notEqual(invalid.status, 0);
    assert.ok(invalid.stderr.includes('未知选项'));
  } finally { await rm(profile, { recursive: true, force: true }); }
});
