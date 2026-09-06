import { parse } from 'acorn';

export function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}

export function textNodes(source) {
  const nodes = [];
  walk(parse(source, { ecmaVersion: 'latest', sourceType: 'module' }), node => {
    if (node.type === 'Literal' && typeof node.value === 'string') {
      nodes.push({ start: node.start, end: node.end, kind: 'string', text: node.value });
    } else if (node.type === 'TemplateElement') {
      nodes.push({ start: node.start, end: node.end, kind: 'template', text: node.value.raw });
    }
  });
  return nodes.sort((a, b) => a.start - b.start);
}

// File-scoped source edits only. Never transform terminal output, model messages or logs.
export function applyCatalog(source, entries, file) {
  const nodes = textNodes(source);
  const edits = [];
  for (const entry of entries) {
    const matches = nodes.filter(node => node.kind === entry.kind && node.text === entry.en);
    if (matches.length !== entry.count) {
      throw new Error(`${file}: 文案匹配数变化：${JSON.stringify(entry.en)}（预期 ${entry.count}，实际 ${matches.length}）`);
    }
    for (const node of matches) {
      edits.push({ ...node, replacement: entry.kind === 'string' ? JSON.stringify(entry.zh) : entry.zh });
    }
  }
  const seen = new Set();
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    if (seen.has(edit.start)) throw new Error(`${file}: 重复翻译位置 ${edit.start}`);
    seen.add(edit.start);
    source = source.slice(0, edit.start) + edit.replacement + source.slice(edit.end);
  }
  parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  return source;
}
