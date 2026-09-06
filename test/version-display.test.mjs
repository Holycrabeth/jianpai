import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { compile, verifyUpstream } from '../scripts/build.mjs';

test('内存编译：启动标题和 --version 使用简派版本，Pi 内部版本不变', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const results = await compile();
  await verifyUpstream(results);
  const interactive = results['dist/modes/interactive/interactive-mode.js'].source;
  const logo = interactive.match(/const logo = (.+);/)[1];
  const identity = value => value;
  const rendered = runInNewContext(logo, { theme: { bold: identity, fg: (_, text) => text } });
  assert.equal(rendered, `简派 Jianpai v${pkg.version}`);
  assert.ok(interactive.includes('this.version = VERSION;'));
  const main = results['dist/main.js'].source;
  assert.ok(main.includes(`console.log(${JSON.stringify(pkg.version)});`));
  assert.ok(!main.includes('console.log(VERSION);'));
  assert.ok(results['dist/config.js'].source.includes('export const VERSION = pkg.version || "0.0.0";'));
});
