# 开发清单

## 当前接续记录（每次启动先读）

保持“先汉化，再逐步改善”，不重新初始化。项目 0.1.0，底座固定 Pi 0.85.0；JavaScript ESM + npm 发布包 + 构建期显示补丁，不是扩展或完整源码分叉。

### 本次：安装脚本与命令入口

- [x] 在 `package.json` / `package-lock.json` 增加中文命令入口 `简派`，同时保留英文入口 `jianpai`。
- [x] 新增 `scripts/install.sh`：支持 `curl ... | bash` 安装，默认下载 `https://nodeble.com/jianpai/jianpai-latest.tar.gz`，安装到 `~/.jianpai/versions/`，生成 `简派` / `jianpai` 包装命令。
- [x] 新增 `scripts/package-release.mjs` 和 `npm run package:release`，生成可上传的 `dist/jianpai-latest.tar.gz`。
- [x] 新增 `docs/install.md`，说明用户安装、发布准备和本地隔离测试方式；更新 README 启动与分发说明。
- [x] 增加安装分发测试：确认中英文 bin 入口一致、安装脚本语法有效；本次 `npm test` 17 项全部通过。
- [x] 本次执行 `npm run check`：检查通过。
- [x] 本机临时目录模拟安装通过：从本地 tar.gz 安装后，`简派 --version` / `jianpai --version` 均输出 `0.85.0`。
- [x] macmini 临时目录隔离安装通过：SSH 环境下自动补 Homebrew Node 路径，`简派 --version` / `jianpai --version` 均输出 `0.85.0`。
- [x] 按用户确认采用 MIT 开源许可，新增 `LICENSE`，并在 `package.json` / README 标注。
- [x] 创建公开 GitHub 仓库：`https://github.com/Holycrabeth/jianpai`。
- [x] 发布 GitHub Release `v0.1.0`，上传 `dist/jianpai-latest.tar.gz`。
- [x] 真实公开 URL 端到端验证通过：本机和 macmini 均可通过 `curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh | bash` 隔离安装，`简派 --version` / `jianpai --version` 输出 `0.85.0`。
- [x] Linux 实机隔离安装验证通过：在 Vultr Ubuntu 25.10 x86_64 上用临时 Node.js 22.22.0、临时安装目录和公开安装脚本安装成功，`简派 --version` / `jianpai --version` 输出 `0.85.0`；未改系统 Node 或全局目录。
- [x] 按用户要求实现“全电脑任意目录输入 `简派` 启动”：安装器在创建 `~/.local/bin/简派` / `jianpai` 后，自动把命令目录写入 zsh / bash / profile 配置；可用 `JIANPAI_UPDATE_SHELL=0` 禁用。
- [x] 本次已在当前电脑创建 `~/.local/bin/简派` / `~/.local/bin/jianpai` 全局包装命令；`command -v 简派` 指向 `~/.local/bin/简派`，`简派 --version` 输出 `0.85.0`。
- [x] 本次新增全局命令安装逻辑后执行 `bash -n scripts/install.sh && npm test`：18 项全部通过。
- [ ] 本次尝试 `npm run check` 失败：现有 `build/pi` 中 `dist/config.js` 过期；当前会话不重建正在使用的构建目录，需退出后在普通终端执行 `npm run build && npm run check && npm test`。
- [x] 发布简派 `0.1.1`：已提交 `Release 0.1.1`，推送 `main` 和 tag `v0.1.1`，GitHub Release 已上传 `dist/jianpai-latest.tar.gz`。
- [x] 本机公开安装升级到 `0.1.1`：`~/.jianpai/current/package.json` 为 `0.1.1`，`简派 --version` 输出 `0.85.0`。
- [x] mac mini 公开安装升级到 `0.1.1`：`~/.jianpai/current/package.json` 为 `0.1.1`，`简派 --version` 输出 `0.85.0`。
- [x] 本机与 mac mini 均已配置 Telegram 完成通知密钥文件 `~/.jianpai/agent/telegram.env`，权限 `600`；均已用 Telegram API 发送测试消息成功。
- [x] 确认仓库源码、已发布 `jianpai-latest.tar.gz` 和重新打包后的本地发布包均不包含用户 Telegram Chat ID / Bot Token。
- [x] 安装器新增 Telegram 可选配置询问：提示“为了确保您知道模型是否完工，建议添加 Telegram 通知机器人...”，用户选择后输入自己的 Chat ID / Bot Token；自动保存到用户本机 `~/.jianpai/agent/telegram.env`，可用 `JIANPAI_CONFIGURE_TELEGRAM=0` 跳过。
- [x] 本次执行 `bash -n scripts/install.sh && npm test && npm run package:release`：19 项测试通过并重新生成 `dist/jianpai-latest.tar.gz`。
- [x] 修正发布打包规则，排除本地临时验证目录 `.local/`；重新检查本地发布包：无 `.local/`、无个人 Telegram 凭据、包含 Telegram 可选配置询问。
- [x] 已刷新 `v0.1.1` tag 和 GitHub Release 附件；通过 GitHub CLI 下载校验：版本 `0.1.1`、无 `.local/`、无个人 Telegram 凭据、包含 Telegram 可选配置询问。
- [x] 本机与 mac mini 已重新安装刷新后的通用 `0.1.1` 包；两台机器的本地 Telegram 配置文件仍在且权限为 `600`。
- [x] 退出当前简派后，重新打包发布并用公开安装命令验证新安装器会自动配置 PATH。
- [x] 按用户要求新增 Telegram 完成通知初版：内置 `extensions/telegram-done.ts`，启动器自动以 `--extension` 加载；配置 `JIANPAI_TELEGRAM_BOT_TOKEN` 和 `JIANPAI_TELEGRAM_CHAT_ID` 后，在 `agent_settled` 发送“简派干完了”。
- [x] 新增 `docs/telegram.md`，说明配置、关闭、隐私边界和为什么使用 `agent_settled`。
- [x] 本次执行 `npm test`：19 项全部通过；执行 `简派 --version` 输出 `0.85.0`，启动器默认加载扩展后基础命令正常。
- [ ] Telegram 完成通知尚未真实端到端发送验证；需要用户提供 Bot Token / Chat ID，或在临时 bot 上验证。
- [ ] `nodeble.com` 当前解析到 `213.249.67.10`，但 HTTP/HTTPS/SSH 探测不可用；后续恢复域名或配置跳转到 GitHub 安装脚本。
- [x] 建立简派自己的模型更新机制：固定 Pi `0.85.0` 稳定底座，新增模型 / 汉化修补通过 `0.1.1`、`0.1.2` 等简派补丁版本发布，不为模型列表频繁升级 Pi。
- [x] 设计并实现简派内置模型增量目录：`models/jianpai.models.json`，启动器生成 `~/.jianpai/agent/generated/jianpai-models.json`，再通过 `JIANPAI_MODELS_PATH` 交给构建后的 Pi 读取。
- [x] 保留用户 `~/.jianpai/agent/models.json` 自定义覆盖能力：合并顺序为简派内置在前、用户配置在后，同 provider / 同模型 `id` 用户优先。
- [x] 新增 `scripts/merge-models.mjs` 和 `test/model-merge.test.mjs`；本次 `npm test` 18 项全部通过。
- [x] 本次执行内存编译和指纹验证：新增 `dist/config.js` 补丁可套用，包含 `JIANPAI_MODELS_PATH`。
- [ ] 当前会话正在使用 `/Users/holycrab/简派/build/pi`，本次未执行 `npm run build` / `npm run check`，需退出后在普通终端执行完整构建验证。

### 上次：命令括号说明与交接整理

- [x] 在 `src/display-values.js`、`locales/patches.mjs` 实现 `ls（列出文件）`、`rg（搜索内容）`，仅改 Bash 工具调用标题。
- [x] 增加源码和内存编译渲染测试：参数 / 原始日志不变、避免误注释、24 / 40 / 80 / 120 列宽度、PowerShell 不套用；2 项通过，不调用模型。
- [x] 本次执行 `npm test`：16 项全部通过，其中新增 2 项验证当前源码及内存编译渲染器，原有 14 项仍验证旧构建；不等于新构建已整体验证。
- [x] 更新使用说明及 `AGENTS.md`：每次先读 TODO，有可推进待办就继续，没有则询问用户；完成打勾，验证单独记录。
- [x] 将原交接文件中的状态、约束和注意事项迁入 TODO / AGENTS；按用户要求删除 `HANDOFF.md`。
- [ ] 退出当前简派后，在普通终端执行 `npm run build && npm run check && npm test`，再 `npm start`；尚未重建，所以当前运行界面仍是旧版。
- [ ] 重启后实际查看 `ls -la`、`rg "关键词"` 的括号显示；本次只验证了内存编译渲染器，未做新构建终端体验。

本次范围：只注释命令开头（可有空格 / Tab）的裸 `ls`、`rg`，参数保持原样；组合命令只处理开头，不解析 `&&`、管道后的命令、包装命令、绝对路径或脚本正文。说明是常见用途，不分析别名 / 函数，也不代表命令安全；`rg --files` 等选项仍显示通用用途。带括号的标题不是可直接执行的命令，复制执行时应使用原始命令。

### 已有构建及验证记录（来自原交接，不是本次重验）

- [x] 原首版构建可运行：63 个文件、1,073 条文案、1,188 处替换；不是 100% 汉化，后续以构建报告为准。
- [x] 上次开发完成干净安装、构建、检查及原有 14 项测试；交接时单独重新执行检查通过。
- [x] 原首版在 macOS 独立 tmux 终端验证启动、设置、中文主题筛选、主题子菜单和登录方式菜单。
- [x] 已配置 `.github/workflows/check.yml`；尚未远程执行，不等于 CI 已通过。

### 维护与启动备忘

- 修改 `locales/`、`src/` 和测试，不直接修改 `build/`、`node_modules/` 或全局 Pi。构建会删除整个 `build/`，不能在正在使用该构建的会话里重建或安装依赖。
- 使用非打包入口 `build/pi/dist/cli.js`，不能换成 `dist/bundle/cli.js`。`@earendil-works/pi-server@0.85.0` 是非打包入口需要的显式依赖，不随意删除。
- `npm start` 启动；其他目录使用 `node /Users/holycrab/简派/bin/jianpai.mjs`，保留当前目录；没有假定全局 `jianpai` 命令已安装。
- 默认配置 `~/.jianpai/agent/`，自定义用 `JIANPAI_CODING_AGENT_DIR`；原 Pi 的 `~/.pi/agent/` 不覆盖，项目资源仍用 `.pi/`。通过 `/login`、`/model` 配置，不索取密钥。
- 默认关闭启动版本检查及安装统计，不代表模型和工具不联网。不通过上游自更新升级底座。
- 原交接时 Git 为 `main`、无首次提交、无远程、源码未跟踪；执行 Git 操作前核实，不丢弃文件。没有发布或修改全局 Pi。
- `locales/upstream-lock.json` 保护已审核的上游文件；新增文件或升级先审核再记录指纹，不能刷新指纹绕过不兼容。
- 显示中文与配置值分离；`Login cancelled` 是内部取消信号，保留原文；中文粘贴标记同时参与恢复与删除，不能只改显示。
- 模板词条保留原始转义形式；终端中文宽度用 `visibleWidth`，不能用 `.length`。检查构建报告和具体显示断言，指纹通过不代表文案命中。
- `npm run audit:zh` 只输出人工复核清单，不代表覆盖率。技术方案见 `docs/architecture.md`，完整边界见 `docs/localization.md`。
- 尚未验证真实服务商登录 / 付费完整对话、第三方扩展组合、动态 OAuth、Windows / Linux、中文输入法候选框；不自动调用付费模型。

## 阶段 0：初始化

- [x] 明确产品定位、中文规范和开发协作约定。
- [x] 按发起人反馈调整顺序：先汉化 Pi，不先做复杂解释功能。

## 阶段 1：汉化 Pi

### 已实现

- [x] 固定 Pi 0.85.0，建立本地中文构建和独立启动器。
- [x] 汉化常用工具标题：读取、撰写、修改、执行命令、查找文件、搜索内容、列出目录。
- [x] 汉化启动、帮助、设置、登录菜单、模型、思考强度、会话管理及信任提示。
- [x] 汉化软件包命令帮助、常见进度与主题错误提示。
- [x] 中文设置值与实际配置值分离，保留英文协议与工具名称。
- [x] 汉化长粘贴标记并验证原文恢复与删除。
- [x] 保留原始日志、代码差异及工具执行行为。
- [x] 加入版本指纹、语法检查及 14 项本地自动测试。
- [x] 在独立终端验证启动、设置和登录菜单。
- [x] 提供启动、停用、无模型演示及覆盖范围说明。
- [x] 保留上游 MIT 版权声明。

### 继续补齐（仍属于第一阶段）

- [ ] 在发起人的真实项目中体验，逐项记录遗漏英文。
- [ ] 验证真实模型登录和完整开发对话；本次未调用付费模型。
- [ ] 复核更多底层错误、动态服务商提示及实验性远程界面。
- [ ] 验证 Windows / Linux 和中文输入法候选框定位。
- [ ] 检查常用第三方扩展兼容性，明确其自定义文字的汉化边界。
- [ ] 如需要，汉化 HTML 导出页面的界面文字。

## 阶段 2：边开发，边改善易懂程度

- [ ] 只针对实际遇到的问题增加有依据的中文解释。
- [ ] 根据真实使用反馈决定是否需要其他交互改进。
- [ ] 确认开源许可、发布方式和目标平台，不提前发布。
