import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initTheme, theme } from '../build/pi/dist/modes/interactive/theme/theme.js';
import { createWriteToolDefinition } from '../build/pi/dist/core/tools/write.js';
import { createReadToolDefinition } from '../build/pi/dist/core/tools/read.js';
import { createEditToolDefinition } from '../build/pi/dist/core/tools/edit.js';
import { createBashToolDefinition } from '../build/pi/dist/core/tools/bash.js';

// Real tools, temporary files, no model calls or credentials.
const cwd = await mkdtemp(join(tmpdir(), 'jianpai-demo-'));
initTheme('dark');
console.log('简派：工具中文显示演示（不调用 AI，不消耗模型额度）\n');
try {
  const tasks = [
    [createWriteToolDefinition(cwd), { path: 'docs/architecture.md', content: '# 简派\n\n先汉化，再让它更易懂。' }],
    [createReadToolDefinition(cwd), { path: 'docs/architecture.md' }],
    [createEditToolDefinition(cwd), { path: 'docs/architecture.md', edits: [{ oldText: '先汉化，再让它更易懂。', newText: '读取、撰写、修改、执行命令。' }] }],
    [createBashToolDefinition(cwd), { command: 'printf "write stays unchanged in raw logs\\n"' }],
  ];
  for (const [tool, args] of tasks) {
    const context = { args, cwd, state: {}, expanded: true, isPartial: false, isError: false, argsComplete: false, executionStarted: false, showImages: false, invalidate() {} };
    const result = await tool.execute('demo-' + tool.name, args);
    const call = tool.renderCall(args, theme, context);
    const outcome = tool.renderResult(result, { expanded: true, isPartial: false }, theme, context);
    console.log(call.render(90).join('\n'));
    console.log(outcome.render(90).join('\n'));
    console.log('操作已完成\n');
  }
} finally { await rm(cwd, { recursive: true, force: true }); }
console.log('演示结束，临时文件已清理。原始命令日志没有被翻译或替换。');
