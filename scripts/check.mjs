import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'acorn';
import { compile, verifyUpstream, upstream, output, root } from './build.mjs';

const results = await compile();
await verifyUpstream(results);
for (const dir of ['bin', 'scripts', 'locales', 'src', 'test']) {
  for (const name of await readdir(join(root, dir))) {
    if (!/\.(mjs|js)$/.test(name)) continue;
    parse(await readFile(join(root, dir, name), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });
  }
}
for (const [file, { source }] of Object.entries(results)) {
  if (source !== await readFile(join(output, file), 'utf8')) throw new Error(`构建已过期：${file}，请运行 npm run build`);
}
if (await readFile(join(root, 'src/display-values.js'), 'utf8') !== await readFile(join(output, 'dist/jianpai-locale.js'), 'utf8')) {
  throw new Error('显示辅助模块已过期，请重新构建');
}
// These modules implement tools, schemas, model prompts and session persistence: must remain byte-identical.
const protectedFiles = [
  ...['read', 'write', 'edit', 'bash', 'powershell', 'grep', 'find', 'ls', 'edit-diff', 'truncate'].map(name => `dist/core/tools/${name}.js`),
  'dist/core/system-prompt.js', 'dist/core/session-manager.js', 'dist/core/auth-storage.js',
];
for (const file of protectedFiles) {
  const [original, built] = await Promise.all([readFile(join(upstream, file)), readFile(join(output, file))]);
  if (!original.equals(built)) throw new Error(`禁止修改执行 / 协议层：${file}`);
}
console.log('检查通过：源文件语法、版本指纹、构建同步、工具执行 / 提示词 / 会话 / 凭据模块均正常。');
