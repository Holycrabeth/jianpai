export const files = {
  'dist/modes/interactive/theme/theme-controller.js': { templates: {
    'Failed to load theme "': '加载主题失败："', '\\nFell back to dark theme.': '\\n已改用默认深色主题。',
  } },
  'dist/modes/interactive/theme/theme-json.js': { strings: {
    '\nMissing required color tokens:\n': '\n缺少必需的颜色项：\n',
    '\n\nPlease add these colors to your theme\'s "colors" object.': '\n\n请将这些颜色添加到主题的 "colors" 对象中。',
    '\nSee the built-in themes (dark.json, light.json) for reference values.': '\n可参考内置主题 dark.json 和 light.json。',
  }, templates: { 'Invalid theme "': '无效的主题 "', '\\n\\nOther errors:\\n': '\\n\\n其他错误：\\n', 'Invalid theme name "': '无效的主题名称 "',
    '": theme names cannot contain "/" because it is reserved for automatic light/dark theme settings.': '"：主题名不能包含 /，该符号用于自动浅色 / 深色主题设置。',
  } },
  'dist/modes/interactive/theme/theme.js': { strings: {
    'no terminal background hint found': '未检测到终端背景信息', 'terminal background': '终端背景', 'Theme not initialized. Call initTheme() first.': '主题尚未初始化，请先调用 initTheme()。',
  }, templates: {
    'Invalid hex color: ': '无效的十六进制颜色：', 'Invalid color value: ': '无效的颜色值：', 'Circular variable reference detected: ': '检测到循环变量引用：',
    'Variable reference not found: ': '找不到引用的变量：', 'Unknown theme color: ': '未知的主题颜色：', 'Unknown theme background color: ': '未知的主题背景颜色：',
    'Invalid theme name "': '无效的主题名称 "', '": theme names cannot contain "/" because it is reserved for automatic light/dark theme settings.': '"：主题名不能包含 /，该符号用于自动浅色 / 深色主题设置。',
    'Invalid theme "': '无效的主题 "', '": expected an object with a "colors" map.': '"：应为包含 colors 映射的对象。',
    'Failed to parse theme ': '解析主题失败：', 'Theme "': '主题 "', '" does not have a source path for export': '" 没有可用于导出的源路径',
    'Theme not found: ': '找不到主题：', 'background color index ': '背景颜色索引 ', 'OSC 11 background rgb(': 'OSC 11 背景 rgb(',
  } },
};
