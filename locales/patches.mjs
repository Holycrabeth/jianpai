// Small, anchored display adaptations not expressible as literal translations.
// Applied BEFORE catalog translations. Never modify tool execution modules.
const C = 'dist/modes/interactive/components/';
const R = 'dist/core/tools/renderers/';
const T = 'node_modules/@earendil-works/pi-tui/dist/components/';
export const patches = {
  'dist/modes/interactive/interactive-mode.js': [
    { from: 'import { APP_NAME,', to: 'import { zhThinking, zhSettingValue } from "../../jianpai-locale.js";\nimport { APP_NAME,' },
    { from: 'Thinking level: ${newLevel}', to: 'Thinking level: ${zhThinking(newLevel)}' },
    { from: ' (thinking: ${result.thinkingLevel})', to: ' (thinking: ${zhThinking(result.thinkingLevel)})' },
    { from: 'Thinking level: ${level}', to: 'Thinking level: ${zhThinking(level)}' },
    { from: 'Default thinking level: ${level}', to: 'Default thinking level: ${zhThinking(level)}' },
    { from: 'TUI mode: ${mode}', to: 'TUI mode: ${zhSettingValue("tui-mode", mode)}' },
    { from: 'theme.fg("accent", APP_NAME)) + theme.fg("dim",', to: 'theme.fg("accent", "简派 Jianpai")) + theme.fg("dim",' },
    { from: '${selection.trusted ? "trusted" : "untrusted"}', to: '${selection.trusted ? "已信任" : "未信任"}' },
  ],
  'dist/cli/args.js': [
    { from: '${ENV_AGENT_DIR.padEnd(32)} - Config directory (default: ~/${CONFIG_DIR_NAME}/agent)', to: '${ENV_AGENT_DIR.padEnd(32)} - 简派配置目录（启动器默认：~/.jianpai/agent）' },
  ],
  [R + 'bash.js']: [
    { from: 'import { Container,', to: 'import { zhShellCommand } from "../../../jianpai-locale.js";\nimport { Container,' },
    { from: 'command ? command : theme.fg', to: 'command ? (prompt === "$" ? zhShellCommand(command) : command) : theme.fg' },
    { from: 'theme.bold(`${prompt} ${commandDisplay}`)', to: 'theme.bold(`执行命令 ${prompt} ${commandDisplay}`)' },
  ],
  [C + 'thinking-selector.js']: [
    { from: 'import { Container,', to: 'import { zhThinking } from "../../../jianpai-locale.js";\nimport { Container,' },
    { from: '${level === currentLevel ? "✓ " : "  "}${level}', to: '${level === currentLevel ? "✓ " : "  "}${zhThinking(level)}' },
    { from: '`${item.value} ${item.description ?? ""}`', to: '`${item.value} ${item.label} ${item.description ?? ""}`' },
  ],
  [C + 'settings-selector.js']: [
    { from: 'import { getSupportedThinkingLevels }', to: 'import { zhThinking, zhTheme, zhSettingValue } from "../../../jianpai-locale.js";\nimport { getSupportedThinkingLevels }' },
    { from: 'new SettingsList(items,', to: 'new SettingsList(items.map(item => ({ ...item, formatValue: value => zhSettingValue(item.id, value) })),', count: 3 },
    { from: '${name === currentTheme ? "✓ " : "  "}${name}', to: '${name === currentTheme ? "✓ " : "  "}${zhTheme(name)}' },
    { from: '${level === activeLevel ? "✓ " : "  "}${level}', to: '${level === activeLevel ? "✓ " : "  "}${zhThinking(level)}' },
    { from: 'description: override ?? undefined,', to: 'description: override === undefined ? undefined : zhThinking(override),' },
    { from: '${config.thinkingLevel}', to: '${zhThinking(config.thinkingLevel)}' },
  ],
  [T + 'editor.js']: [
    { from: '/\\[paste #(\\d+)( (\\+\\d+ lines|\\d+ chars))?\\]/g', to: '/\\[粘贴 #(\\d+)( (\\+\\d+ 行|\\d+ 字符))?\\]/g' },
    { from: '/^\\[paste #(\\d+)( (\\+\\d+ lines|\\d+ chars))?\\]$/', to: '/^\\[粘贴 #(\\d+)( (\\+\\d+ 行|\\d+ 字符))?\\]$/' },
    { from: 'segment.length >= 10 && PASTE_MARKER_SINGLE.test(segment)', to: 'segment.length >= 7 && PASTE_MARKER_SINGLE.test(segment)' },
  ],
  [T + 'settings-list.js']: [
    { from: 'truncateToWidth(item.currentValue, valueMaxWidth, "")', to: 'truncateToWidth(item.formatValue ? item.formatValue(item.currentValue) : item.currentValue, Math.max(0, valueMaxWidth), "")' },
    { from: 'lines.push(this.theme.hint("  No settings available"));', to: 'lines.push(truncateToWidth(this.theme.hint("  No settings available"), width));' },
  ],
  [C + 'footer.js']: [
    { from: 'import {', to: 'import { zhThinking } from "../../../jianpai-locale.js";\nimport {', occurrence: 0 },
    { from: '`${modelName} • ${thinkingLevel}`', to: '`${modelName} · ${zhThinking(thinkingLevel)}`' },
  ],
  [C + 'model-selector.js']: [
    { from: 'theme.fg("accent", "all")', to: 'theme.fg("accent", "全部")' },
    { from: 'theme.fg("muted", "all")', to: 'theme.fg("muted", "全部")' },
    { from: 'theme.fg("accent", "scoped")', to: 'theme.fg("accent", "已选")' },
    { from: 'theme.fg("muted", "scoped")', to: 'theme.fg("muted", "已选")' },
    { from: '"default".startsWith(normalized)', to: '("default".startsWith(normalized) || "默认".startsWith(normalized))' },
  ],
  [C + 'session-selector.js']: [
    { from: 'keyHint("app.session.toggleNamedFilter", "named")', to: 'keyHint("app.session.toggleNamedFilter", "已命名")' },
    { from: 'keyHint("app.session.rename", "rename")', to: 'keyHint("app.session.rename", "重命名")' },
  ],
  'dist/cli/list-models.js': [
    { from: 'import { fuzzyFilter }', to: 'import { fuzzyFilter, visibleWidth }' },
    ...['provider', 'model', 'context', 'maxOut', 'thinking', 'images'].flatMap(key => [
      { from: `Math.max(headers.${key}.length, ...rows.map((r) => r.${key}.length))`, to: `Math.max(visibleWidth(headers.${key}), ...rows.map((r) => visibleWidth(r.${key})))` },
      ...['headers', 'row'].map(obj => ({ from: `${obj}.${key}.padEnd(widths.${key})`, to: `${obj}.${key} + " ".repeat(Math.max(0, widths.${key} - visibleWidth(${obj}.${key})))` })),
    ]),
  ],
};

export function applyPatches(source, entries = [], file) {
  for (const entry of entries) {
    const count = source.split(entry.from).length - 1;
    if (entry.occurrence === 0) {
      if (!count) throw new Error(`${file}: 找不到补丁位置 ${entry.from}`);
      source = source.replace(entry.from, entry.to);
    } else {
      if (count !== (entry.count ?? 1)) throw new Error(`${file}: 补丁匹配数错误 ${entry.from}: ${count}`);
      source = source.split(entry.from).join(entry.to);
    }
  }
  return source;
}
