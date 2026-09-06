// Only literal text in reviewed display files is translated. Keys/paths/protocol values stay English.
export const common = {
  'Thinking...': '正在思考…', 'Working': '正在处理', 'Loading...': '正在加载…',
  'Unknown error': '未知错误', 'Unknown error occurred': '发生未知错误',
  'to expand': '展开', 'to collapse': '收起', ' to expand)': ' 展开)',
  'to cancel': '取消', 'to cancel,': '取消，', 'to submit': '提交', 'to close': '关闭',
  'Yes': '是', 'No': '否', 'Cancel': '取消', 'Continue': '继续',
  'Extensions': '扩展', 'Skills': '技能', 'Prompts': '提示词模板', 'Themes': '主题',
  'Theme': '主题', 'Dark': '深色', 'Light': '浅色',
  'No reasoning': '不启用思考', 'Very brief reasoning (~1k tokens)': '极简思考（约 1 千词元）',
  'Light reasoning (~2k tokens)': '轻度思考（约 2 千词元）', 'Moderate reasoning (~8k tokens)': '中度思考（约 8 千词元）',
  'Deep reasoning (~16k tokens)': '深入思考（约 1.6 万词元）', 'Extra-high reasoning (~32k tokens)': '更深入思考（约 3.2 万词元）',
  'Maximum reasoning': '最大思考强度',
  '  Enter to select · Ctrl+S to set as default · Esc to cancel': '  回车选择 · Ctrl+S 设为默认 · Esc 取消',
  'Refreshing model catalogs…': '正在刷新模型列表…',
  'Model refresh timed out; showing cached models.': '刷新模型超时，显示已缓存的模型。',
  'Model refresh timed out; searching cached models.': '刷新模型超时，在已缓存的模型中搜索。',
  'Model catalogs refreshed.': '模型列表已刷新。',
  '  No matching models': '  没有匹配的模型', 'Model Name: ': '模型名称：',
  // "Login cancelled" is an internal cancellation sentinel shared with provider code, not UI text.
  'stored credential': '已保存的凭据',
  'Error: ': '错误：', 'Warning: ': '警告：',
};
export const commonTemplates = {
  ' to expand)': ' 展开)', ' to cancel)': ' 取消)', ' to cancel': ' 取消',
  ' more lines,': ' 行未显示，', ' more lines, ': ' 行未显示，共 ', ' total,': ' 行，',
  ' earlier lines,': ' 行较早输出，', ' more lines (': ' 行未显示（',
  'Error: ': '错误：', 'Warning: ': '警告：',
  'Could not refresh ': '无法刷新 ', '; showing cached models.': '，显示已缓存的模型。',
  '; searching cached models.': '，在缓存模型中搜索。',
  'Could not refresh model catalogs: ': '无法刷新模型列表：',
  'Failed to export session: ': '导出会话失败：', 'Model Name: ': '模型名称：',
  'Full output: ': '完整输出：', '[Truncated: ': '[输出已截断：',
  ' (timeout ': '（超时限制 ', 's)': ' 秒）',
};
export const files = {};
function add(file, strings = {}, templates = {}) { files[file] = { strings, templates }; }
const C = 'dist/modes/interactive/components/';
const R = 'dist/core/tools/renderers/';
const T = 'node_modules/@earendil-works/pi-tui/dist/components/';
add(R + 'write.js', { write: '撰写', '[invalid content arg - expected string]': '[内容参数无效：应为文本]' });
add(R + 'read.js', { read: '读取', docs: '文档', resource: '项目约定' }, {
  'read ': '读取 ', '\\x1b[1m[skill]\\x1b[22m ': '\\x1b[1m[技能]\\x1b[22m ',
  '[First line exceeds ': '[首行超过 ', ' limit]': ' 限制]', '[Truncated: showing ': '[输出已截断：已显示 ',
  ' of ': ' / ', ' lines (': ' 行（上限 ', ' line limit)]': ' 行）]',
  ' lines shown (': ' 行已显示（', ' limit)]': ' 上限）]',
});
add(R + 'edit.js', { edit: '修改' });
add(R + 'bash.js', { Elapsed: '已运行', Took: '耗时' }, {
  s: ' 秒', 'Truncated: showing ': '输出已截断：已显示 ', ' of ': ' / ', ' lines': ' 行',
  'Truncated: ': '输出已截断：', ' lines shown (': ' 行已显示（', ' limit)': ' 上限）',
});
for (const [name, label] of [['find', '查找文件'], ['grep', '搜索内容'], ['ls', '列出目录']]) {
  add(R + name + '.js', { [name]: label, ...(name === 'grep' ? { 'some lines truncated': '部分行已截断' } : {}) }, {
    ' in ': ' 在 ', ' (limit ': '（上限 ', ' limit ': ' 上限 ', ' results limit': ' 个结果上限',
    ' matches limit': ' 个匹配上限', ' entries limit': ' 个条目上限', ' limit': ' 上限',
  });
}
add('dist/core/tools/render-utils.js', { '[invalid arg]': '[参数无效]' });
add(C + 'tool-execution.js');
add(C + 'assistant-message.js', {
  'Response was truncated before completion.': '回复尚未完成就被截断了。', 'Operation aborted': '操作已中止',
});
add(C + 'bash-execution.js', { '(cancelled)': '（已取消）' }, {
  'Running... (': '正在运行…（', '(exit ': '（退出码 ', 'Output truncated. Full output: ': '输出已截断。完整输出：',
});
add(C + 'bordered-loader.js', { cancel: '取消' });
add(C + 'branch-summary-message.js', { '**Branch Summary**\n\n': '**分支摘要**\n\n', 'Branch summary (': '分支摘要（' }, {
  '\\x1b[1m[branch]\\x1b[22m': '\\x1b[1m[分支]\\x1b[22m',
});
add(C + 'compaction-summary-message.js', {}, {
  '\\x1b[1m[compaction]\\x1b[22m': '\\x1b[1m[上下文压缩]\\x1b[22m',
  '**Compacted from ': '**压缩前为 ', ' tokens**\\n\\n': ' 词元**\\n\\n',
  'Compacted from ': '压缩前为 ', ' tokens (': ' 词元（',
});
add(C + 'skill-invocation-message.js', {}, {
  '\\x1b[1m[skill]\\x1b[22m': '\\x1b[1m[技能]\\x1b[22m',
  '\\x1b[1m[skill]\\x1b[22m ': '\\x1b[1m[技能]\\x1b[22m ',
});
add(C + 'custom-entry.js', {}, { '] renderer failed: ': '] 显示失败：' });
add(C + 'custom-editor.js', {}, { ' more ': ' 行未显示 ' });
add(C + 'config-selector.js', {
  'User settings': '用户设置', 'Project settings': '项目设置', 'Project Local Resources': '项目本地资源',
  'Global Resources': '全局资源', 'switch mode': '切换范围', 'cycle inherit/+/-': '切换继承 / 启用 / 停用',
  toggle: '切换', close: '关闭', '  No resources found': '  没有找到资源',
  ' · inherited global': ' · 继承全局', '  project load': '  项目启用', '  project unload': '  项目停用',
  '  inherited global': '  继承全局',
}, { 'User (': '用户（', 'Project (': '项目（', '/settings.json · inherited global resources are dimmed': '/settings.json · 继承的全局资源以暗色显示' });
add(C + 'extension-editor.js', { submit: '提交', newline: '换行', cancel: '取消', 'external editor': '外部编辑器' });
add(C + 'extension-input.js', { submit: '提交', cancel: '取消' });
add(C + 'extension-selector.js', { navigate: '移动', select: '选择', cancel: '取消' });
add(C + 'first-time-setup.js', {
  'Share anonymous usage data': '分享匿名使用数据', "Don't share": '不分享', 'Pick a theme.': '选择一个主题。',
  'Opt-in to anonymous usage data sharing?': '是否自愿分享匿名使用数据？',
  'Opting in stores a tracking identifier in settings.json and enables anonymous\nusage analytics. This helps us to better debug, reproduce, and resolve issues\nand bugs within Pi. You can observe what is shared using /privacy and make\nchanges anytime in settings.json.': '同意后会在 settings.json 中保存跟踪标识，并启用匿名使用分析，\n用于帮助 Pi 排查和修复问题。可通过 /privacy 查看分享内容，\n也可随时在 settings.json 中修改选择。',
  navigate: '移动', continue: '继续', finish: '完成', 'skip setup': '跳过设置',
}, { 'Welcome to ': '欢迎使用 ', ', the minimal coding agent.': '，简洁的 AI 编程助手。', 'Detected system appearance: ': '检测到系统外观：' });
add(C + 'footer.js', { ' (sub)': '（订阅）', ' (auto)': '（自动）', 'no-model': '未选择模型' }, {
  ' • thinking off': ' · 思考已关闭', R: '缓存读 ', W: '缓存写 ', CH: '命中 ',
});
add(C + 'login-dialog.js', { 'Cmd+click to open': '按住 Cmd 点击打开', 'Ctrl+click to open': '按住 Ctrl 点击打开' }, {
  'Login to ': '登录 ', 'Enter code: ': '输入验证码：', 'e.g., ': '例如：',
});
add(C + 'mermaid.js', {}, { ' more)': ' 项未显示）', 'Mermaid diagram not rendered: ': '未能显示 Mermaid 图表：' });
add(C + 'model-selector.js', {
  'Only showing models from configured providers. Use /login to add providers.': '仅显示已配置服务商的模型。使用 /login 添加服务商。',
  'Scope: ': '范围：', scope: '切换范围', ' (all/scoped)': '（全部 / 已选）', ' default': ' 默认', ' · default': ' · 默认',
}, { ' model catalogs (': ' 个模型列表（', '); showing cached models.': '），显示已缓存的模型。', '  Model Name: ': '  模型名称：' });
add(C + 'oauth-selector.js', {
  subscription: '订阅账号', 'API key': 'API 密钥', 'Select provider to configure:': '选择要配置的服务商：',
  'Select provider to logout:': '选择要退出登录的服务商：', 'No providers available': '没有可用的服务商',
  'No providers logged in. Use /login first.': '尚未登录服务商。请先使用 /login。',
  'No matching providers': '没有匹配的服务商', ' • unconfigured': ' · 未配置', 'subscription configured': '已配置订阅账号',
  'API key configured': '已配置 API 密钥', ' ✓ configured': ' ✓ 已配置',
}, { 'env: ': '环境变量：' });
add(C + 'scoped-models-selector.js', {
  'Model Configuration': '模型配置', 'all enabled': '全部已启用', '(unsaved)': '（未保存）',
  ' [unavailable]': ' [不可用]', 'Model unavailable': '模型不可用',
}, { 'Session-only. ': '仅本次会话生效。', ' to save to settings.': ' 保存到设置。',
  ' enabled': ' 个已启用', ' unavailable': ' 个不可用', ' toggle': ' 切换', ' all': ' 全选',
  ' clear': ' 清空', ' provider': ' 服务商', ' reorder': ' 调整顺序', ' save': ' 保存',
});
add(C + 'session-selector-search.js', { 'Empty regex': '正则表达式为空' });
add(C + 'session-selector.js', {
  now: '刚刚', 'Resume Session (Current Folder)': '继续会话（当前文件夹）', 'Resume Session (All)': '继续会话（全部）',
  Threaded: '按分支', Recent: '最近', Fuzzy: '相关度', 'Sort: ': '排序：', All: '全部', Named: '已命名',
  'Name: ': '名称：', '○ Current Folder | ': '○ 当前文件夹 | ', '◉ Current Folder': '◉ 当前文件夹',
  ' | ○ All': ' | ○ 全部', '◉ All': '◉ 全部', confirm: '确认', cancel: '取消', '(on)': '（开）', '(off)': '（关）',
  scope: '切换范围', 're:<pattern> regex · "phrase" exact': 're:<表达式> 正则匹配 · "短语" 精确匹配',
  sort: '排序', delete: '删除', 'Cannot delete the currently active session': '不能删除当前正在使用的会话',
  '  No sessions found': '  没有找到会话', '  No sessions in current folder. Press Tab to view all.': '  当前文件夹没有会话。按 Tab 查看全部。',
  'Session moved to trash': '会话已移到废纸篓', 'Session deleted': '会话已删除', 'Rename Session': '重命名会话',
}, { m: ' 分钟前', h: ' 小时前', d: ' 天前', w: ' 周前', mo: ' 个月前', y: ' 年前',
  'Loading ': '正在加载 ', 'Delete session? ': '删除这个会话？', 'path ': '路径 ',
  '  No named sessions found. Press ': '  没有已命名的会话。按 ', ' to show all.': ' 查看全部。',
  '  No named sessions in current folder. Press ': '  当前文件夹没有已命名会话。按 ',
  ' to show all, or Tab to view all.': ' 显示全部名称，或按 Tab 查看所有文件夹。',
  'Failed to delete: ': '删除失败：', ' to save · ': ' 保存 · ', 'Failed to load sessions: ': '加载会话失败：',
});
add(C + 'settings-selector.js', {
  Ask: '每次询问', 'Always trust': '始终信任', 'Never trust': '从不信任',
  'Anthropic extra usage': 'Anthropic 额外用量', 'Warn when Anthropic subscription auth may use paid extra usage': '订阅账号可能产生额外付费时发出提醒',
  '  Automatic': '  自动', 'Use separate themes for light and dark terminal appearance': '为终端的浅色和深色外观分别设置主题',
  'Select a theme, or choose Automatic to follow terminal appearance.': '选择主题，或选择“自动”跟随终端外观。',
  'Automatic Theme': '自动主题', 'Choose themes for terminal light and dark appearance.': '分别选择浅色和深色终端的主题。',
  'Light/dark detection requires terminal support.': '自动检测浅色 / 深色需要终端支持。',
  'Light theme': '浅色主题', 'Theme to use in automatic mode when the terminal is light': '自动模式下，终端为浅色时使用的主题',
  'Light Theme': '浅色主题', 'Select the theme to use for light terminal appearance': '选择浅色终端使用的主题',
  'Dark theme': '深色主题', 'Theme to use in automatic mode when the terminal is dark': '自动模式下，终端为深色时使用的主题',
  'Dark Theme': '深色主题', 'Select the theme to use for dark terminal appearance': '选择深色终端使用的主题',
  Apply: '应用', 'Save and go back': '保存并返回', 'save and go back': '保存并返回',
  'Change mode': '切换模式', 'Switch to one theme for light and dark': '浅色和深色均使用同一主题', 'switch to single theme': '改用单一主题',
  'Auto-compact': '自动压缩上下文', 'Automatically compact context when it gets too large': '对话过长时自动生成摘要，腾出上下文空间',
  'Steering mode': '工作中消息的发送方式',
  "Enter while streaming queues steering messages. 'one-at-a-time': deliver one, wait for response. 'all': deliver all at once.": 'AI 工作时按回车排队发送消息。“逐条”：发一条并等待回复；“全部”：一次发送全部。',
  'Follow-up mode': '后续消息的发送方式', 'Transport': '连接方式', 'Preferred transport for providers that support multiple transports': '服务商支持多种连接方式时优先使用的方式',
  'HTTP idle timeout': '网络空闲超时', 'Maximum idle gap while waiting for HTTP headers or body chunks. Disable for local models that pause longer than five minutes.': '等待网络响应时允许的最长空闲时间。本地模型若暂停超过五分钟，可关闭此限制。',
  'Hide thinking': '隐藏思考内容', 'Hide thinking blocks in assistant responses': '不显示 AI 回复中的思考区块',
  'Mermaid diagrams': 'Mermaid 图表', 'Render Mermaid code blocks as Unicode diagrams': '将 Mermaid 代码显示为字符图表',
  'Cache miss notices': '缓存未命中提示', 'Show transcript notices for cache costs and provider recovery diagnostics': '在对话中显示缓存费用和服务商恢复诊断提示',
  'Collapse changelog': '收起更新日志', 'Show condensed changelog after updates': '更新后仅显示简短的更新日志',
  'Quiet startup': '简洁启动', 'Disable verbose printing at startup': '启动时不显示详细提示',
  'Install telemetry': '安装统计', 'Send an anonymous version/update ping after changelog-detected updates': '检测到版本更新后发送匿名版本统计',
  'Default project trust': '默认项目信任策略', 'Fallback behavior when no extension or saved trust decision decides project trust': '没有扩展决定或已保存的信任选择时，如何处理项目资源',
  'Double-escape action': '连按两次 Esc', 'Action when pressing Escape twice with empty editor': '输入框为空时连按两次 Esc 的操作',
  'Tree filter mode': '会话树筛选', 'Default filter when opening /tree': '打开 /tree 时默认显示哪些记录',
  Warnings: '提醒', 'Enable or disable individual warnings': '分别开启或关闭各类提醒', configure: '配置',
  'Default thinking level per model': '各模型默认思考强度', 'Per-Model Thinking Level': '模型思考强度',
  'Select a model to configure': '选择要配置的模型', 'No models available': '没有可用模型',
  'Log in to a provider or configure an API key first': '请先登录服务商或配置 API 密钥',
  'Select default thinking level for this model': '选择此模型的默认思考强度', '  (clear override)': '  （恢复全局默认）',
  'TUI mode': '终端界面模式', 'Interface layout; fullscreen mode is experimental': '界面布局；全屏模式仍为实验功能',
  'Fullscreen exit output': '退出全屏时的输出', 'Print the transcript or only a session resume hint when exiting fullscreen mode': '退出全屏时显示完整对话，或只显示继续会话的提示',
  'Fullscreen scrollbar': '全屏滚动条', 'Scrollbar behavior in fullscreen mode; has no effect in regular mode': '仅控制全屏模式中的滚动条',
  'Fullscreen copy on select': '全屏选中即复制', 'Automatically copy selected text in fullscreen mode; disable to copy selections with Ctrl+X': '全屏时自动复制选中的文字；关闭后使用 Ctrl+X 复制',
  'Color theme for the interface': '界面的颜色主题', 'Show images': '显示图片', 'Render images inline in terminal': '直接在终端内显示图片',
  'Image width': '图片宽度', 'Preferred inline image width in terminal cells': '图片的首选显示宽度，单位为终端字符格',
  'Auto-resize images': '自动缩小图片', 'Resize large images to 2000x2000 max for better model compatibility': '将大图缩小到最多 2000×2000，提高模型兼容性',
  'Block images': '禁止发送图片', 'Prevent images from being sent to LLM providers': '不向 AI 服务商发送图片',
  'Skill commands': '技能命令', 'Register skills as /skill:name commands': '允许通过 /skill:name 命令使用技能',
  'Show hardware cursor': '显示终端光标', 'Show the terminal cursor while still positioning it for IME support': '显示真实终端光标，便于中文输入法定位候选框',
  'Editor padding': '输入区边距', 'Horizontal padding for input editor (0-3)': '输入区左右留白（0–3 格）',
  'Output padding': '输出区边距', 'Horizontal padding for user messages, assistant messages, and thinking': '用户消息、AI 回复和思考内容的左右留白',
  'Autocomplete max items': '补全列表最大条数', 'Max visible items in autocomplete dropdown (3-20)': '补全下拉列表最多显示的条数（3–20）',
  'Clear on shrink': '内容收起后清屏', 'Clear empty rows when content shrinks (may cause flicker)': '内容缩短后清除空行（可能闪烁）',
  'Terminal progress': '终端进度提示', 'Show OSC 9;4 progress indicators in the terminal tab bar': '通过 OSC 9;4 在终端标签栏显示进度',
}, { ' configured': ' 个已配置',
  " queues follow-up messages until agent stops. 'one-at-a-time': deliver one, wait for response. 'all': deliver all at once.": ' 将后续消息排队，等 AI 完成后发送。“逐条”：发一条并等待回复；“全部”：一次发送全部。',
  'Override the default thinking level for specific models. ': '为指定模型单独设置默认思考强度。', ' cycles in-session.': ' 可在本次会话中切换。',
  'Thinking Level for ': '思考强度：', 'Revert to global default (': '恢复全局默认（',
});
add(C + 'settings-submenu.js', {
  '  Type to filter · Enter to select · Esc to go back': '  输入筛选 · 回车选择 · Esc 返回',
  '  Enter to select · Esc to go back': '  回车选择 · Esc 返回',
}, { 'Step ': '步骤 ' });
add(C + 'show-images-selector.js', { 'Show images inline in terminal': '在终端内显示图片', 'Show text placeholder instead': '改为显示文字占位符' });
add(C + 'status-indicator.js', { 'Context overflow detected, ': '上下文超出容量，' }, {
  'Retrying (': '正在重试（', ') in ': '），等待 ', 's... (': ' 秒…（',
  'Compacting context... ': '正在压缩上下文… ', 'Auto-compacting... ': '正在自动压缩… ', 'Summarizing branch... (': '正在生成分支摘要…（',
});
add(C + 'theme-selector.js', { '(current)': '（当前）' });
add(C + 'thinking-selector.js', { 'Thinking Level': '思考强度' }, { ' · default': ' · 默认', ' cycles thinking levels in-session': ' 在当前会话中切换思考强度' });
add(C + 'tree-selector.js', {
  ' [no-tools]': ' [隐藏工具]', ' [user]': ' [仅用户]', ' [labeled]': ' [仅书签]', ' [all]': ' [全部]', ' [+label time]': ' [书签时间]',
  '  No entries found': '  没有找到记录', 'user: ': '用户：', 'assistant: ': '助手：', '(aborted)': '（已中止）',
  '(no content)': '（无内容）', '(cleared)': '（已清除）', '[title: ': '[标题：', empty: '空',
  'Type to search:': '输入搜索：', move: '移动', page: '翻页', branch: '分支', copy: '复制',
  'label time': '书签时间', filters: '筛选', cycle: '切换', 'Label (empty to remove):': '书签名称（留空删除）：',
  save: '保存', cancel: '取消', '  Session Tree': '  会话树',
}, {
  '[bash]: ': '[执行命令]：', '[compaction: ': '[上下文压缩：', 'k tokens]': ' 千词元]',
  '[branch summary]: ': '[分支摘要]：', '[model: ': '[模型：', '[thinking: ': '[思考强度：', '[custom: ': '[自定义：', '[label: ': '[书签：',
  '[read: ': '[读取：', '[write: ': '[撰写：', '[edit: ': '[修改：', '[bash: ': '[执行命令：',
  '[grep: /': '[搜索内容：/', '/ in ': '/ 位于 ', '[find: ': '[查找文件：', ' in ': ' 位于 ', '[ls: ': '[列出目录：',
});
add(C + 'trust-selector.js', { none: '未设置', trusted: '已信任', untrusted: '未信任', 'Project trust': '项目信任', navigate: '移动', save: '保存', cancel: '取消' }, {
  ' (inherited from ': '（继承自 ', 'Saved decision: ': '已保存的选择：', 'Current session: ': '当前会话：',
});
add(C + 'user-message-selector.js', {
  '  No user messages found': '  没有找到用户消息', 'Fork from Message': '从消息创建分支',
  'Select a user message to copy the active path up to that point into a new session': '选择一条用户消息，将此前的当前分支记录复制到新会话',
}, { '  Message ': '  消息 ', ' of ': ' / ' });
add('dist/modes/interactive/external-editor.js', {}, { 'Launching external editor: ': '正在打开外部编辑器：', '\\nPi will resume when the editor exits.\\n': '\\n关闭编辑器后将返回简派。\\n' });
add('dist/modes/interactive/tui-renderer.js', {}, { ' ↓ Jump to latest message': ' ↓ 跳到最新消息' });
add(T + 'editor.js', { '[paste #': '[粘贴 #' }, {
  ' more ': ' 行未显示 ', '[paste #': '[粘贴 #', ' lines]': ' 行]', ' chars]': ' 字符]',
  '\\\\[paste #': '\\\\[粘贴 #',
  '( (\\\\+\\\\d+ lines|\\\\d+ chars))?\\\\]': '( (\\\\+\\\\d+ 行|\\\\d+ 字符))?\\\\]',
});
add(T + 'loader.js');
add(T + 'select-list.js', { '  No matching commands': '  没有匹配的选项' });
add(T + 'settings-list.js', {
  '  No settings available': '  没有可用设置', '  No matching settings': '  没有匹配的设置',
  '  Type to search · Enter/Space to change · Esc to cancel': '  输入搜索 · 回车 / 空格更改 · Esc 返回',
  '  Enter/Space to change · Esc to cancel': '  回车 / 空格更改 · Esc 返回',
});
