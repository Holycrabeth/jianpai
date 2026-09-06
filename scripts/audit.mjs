import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compile, root } from './build.mjs';
import { textNodes } from './catalog.mjs';

// A review aid, not a claim of translation coverage: paths, protocols and original logs can be English.
let report = '# 待人工复核的英文片段\n\n此清单是启发式扫描结果，不代表这些内容都应该翻译。\n';
for (const [file, result] of Object.entries(await compile())) {
  const candidates = [...new Set(textNodes(result.source).map(node => node.text).filter(text =>
    /[a-zA-Z]{2,}[ :][a-zA-Z]{2,}/.test(text) && !/[\u3400-\u9fff]/.test(text) && !text.includes('://') && !text.includes('\\x1b')
  ))];
  if (!candidates.length) continue;
  report += `\n## ${file}\n` + candidates.map(text => `- ${JSON.stringify(text)}\n`).join('');
}
await mkdir(join(root, '.local'), { recursive: true });
await writeFile(join(root, '.local/english-review.md'), report);
console.log('复核清单：.local/english-review.md（不是覆盖率统计）');
