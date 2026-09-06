// Display-only labels. Never use these strings as protocol/configuration values.
// Deliberately recognize only the first bare command, not shell syntax or arguments.
// These are conventional meanings, not an analysis of aliases/functions or safety.
export function zhShellCommand(command) {
  return command.replace(/^([ \t]*)(ls|rg)(?=[ \t\r\n]|$)/, (_, space, name) =>
    `${space}${name}（${name === 'ls' ? '列出文件' : '搜索内容'}）`);
}
const thinking = Object.freeze({ off: '关闭', minimal: '极简', low: '轻度', medium: '中度', high: '深入', xhigh: '更深入', max: '最大' });
export function zhThinking(value) { return Object.hasOwn(thinking, value) ? thinking[value] : value; }
export function zhTheme(value) { return value === 'dark' ? '深色' : value === 'light' ? '浅色' : value; }
const booleanSettings = new Set(['autocompact', 'anthropic-extra-usage', 'hide-thinking', 'cache-miss-notices', 'collapse-changelog', 'quiet-startup', 'install-telemetry', 'fullscreen-copy-on-select', 'show-images', 'auto-resize-images', 'block-images', 'skill-commands', 'show-hardware-cursor', 'clear-on-shrink', 'terminal-progress']);
const values = {
  'steering-mode': { 'one-at-a-time': '逐条', all: '全部' },
  'follow-up-mode': { 'one-at-a-time': '逐条', all: '全部' },
  transport: { auto: '自动', sse: 'SSE', websocket: 'WebSocket', 'websocket-cached': 'WebSocket（缓存）' },
  'mermaid-rendering': { off: '关闭', final: '完成后显示', streaming: '实时显示' },
  'double-escape-action': { tree: '会话树', fork: '创建分支', none: '无操作' },
  'tree-filter-mode': { default: '默认', 'no-tools': '隐藏工具', 'user-only': '仅用户', 'labeled-only': '仅书签', all: '全部' },
  'tui-mode': { regular: '普通', fullscreen: '全屏' },
  'fullscreen-exit-output': { transcript: '完整对话', 'resume-hint': '继续会话提示' },
  'fullscreen-scrollbar': { auto: '自动', always: '始终显示', hidden: '隐藏' },
  'model-thinking': { none: '未配置' },
};
export function zhSettingValue(id, value) {
  if (booleanSettings.has(id)) return value === 'true' ? '开启' : value === 'false' ? '关闭' : value;
  if (['theme', 'light-theme', 'dark-theme'].includes(id)) return value.split('/').map(zhTheme).join(' / ');
  if (id === 'http-idle-timeout') return value === 'disabled' ? '不限制' : value.replace(/ (min|minutes?)$/, ' 分钟').replace(/ (sec|seconds?)$/, ' 秒');
  const map = values[id];
  return map && Object.hasOwn(map, value) ? map[value] : value;
}
