import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { stripVTControlCharacters as strip } from 'node:util';
import { zhShellCommand } from '../src/display-values.js';
import { compile, verifyUpstream, upstream } from '../scripts/build.mjs';

test('命令注释只识别开头的 ls / rg，不改参数和脚本内容', () => {
  for (const [input, expected] of [
    ['ls', 'ls（列出文件）'], [' ls -la 中文目录', ' ls（列出文件） -la 中文目录'],
    ['rg "ls rg" .', 'rg（搜索内容） "ls rg" .'],
    ['ls -la && rg foo', 'ls（列出文件） -la && rg foo'],
  ]) assert.equal(zhShellCommand(input), expected);
  for (const input of ['', 'r', 'lsof', 'rg.exe foo', './ls', '/bin/ls', 'echo ls rg',
    'printf "ls\\nrg"', 'cd src && rg foo', 'env X=1 ls', 'sudo ls',
    'cat <<EOF\nls\nrg\nEOF', '"ls"', 'ls; rg foo', 'ls() { echo hi; }']) {
    assert.equal(zhShellCommand(input), input);
  }
});

test('内存编译的真实渲染器显示注释，保留输入输出和窄屏排版', async () => {
  // Compile without deleting or writing build/: safe inside a running Jianpai session.
  const results = await compile();
  await verifyUpstream(results);
  const file = 'dist/core/tools/renderers/bash.js';
  const base = pathToFileURL(join(upstream, file));
  const require = createRequire(base);
  const source = results[file].source.replace(/from "([^"]+)"/g, (_, spec) => {
    const url = spec.endsWith('/jianpai-locale.js')
      ? new URL('../src/display-values.js', import.meta.url)
      : spec.startsWith('.') ? new URL(spec, base) : pathToFileURL(require.resolve(spec));
    return `from ${JSON.stringify(url.href)}`;
  });
  const { createShellRenderers } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const { initTheme, theme } = await import(pathToFileURL(join(upstream, 'dist/modes/interactive/theme/theme.js')));
  const { visibleWidth } = await import(pathToFileURL(require.resolve('@earendil-works/pi-tui')));
  initTheme('dark');
  const context = () => ({ state: {}, executionStarted: false, invalidate() {}, showImages: false });
  for (const command of ['ls -la 中文目录', 'rg "ls rg" 中文目录']) {
    const args = Object.freeze({ command, timeout: 3 });
    const renderer = createShellRenderers('$');
    const component = renderer.renderCall(args, theme, context());
    assert.ok(strip(component.render(120).join('\n')).includes('执行命令 $ ' + zhShellCommand(command)));
    assert.equal(args.command, command);
    for (const width of [24, 40, 80, 120]) {
      for (const line of component.render(width)) assert.ok(visibleWidth(line) <= width);
    }
    const result = { content: [{ type: 'text', text: 'ls rg 原始日志' }] };
    assert.ok(strip(renderer.renderResult(result, { expanded: true, isPartial: false }, theme, context()).render(120).join('\n')).includes('ls rg 原始日志'));
  }
  const ps = createShellRenderers('PS>');
  assert.ok(!strip(ps.renderCall({ command: 'ls' }, theme, context()).render(120).join('\n')).includes('（'));
});
