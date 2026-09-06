# 简派 Jianpai

**简单易懂的 Pi。先把 Pi 汉化，再在实际使用中逐步改善体验。**

基于 [Pi](https://pi.dev/) **0.85.0** 的独立中文终端构建。保留 Pi 的功能、工具名称和操作方式，将界面显示文字改为简体中文。

```text
读取 docs/architecture.md
撰写 docs/architecture.md
修改 docs/architecture.md
执行命令 $ npm test
```

> 当前状态：首版中文构建可运行，主要终端界面已覆盖。不是“所有字符串已 100% 汉化”；具体范围与尚未覆盖内容见 [汉化范围](docs/localization.md)。

## 启动

需要 Node.js 22.19 或更新版本。首次准备：

```bash
npm ci --ignore-scripts
npm run build
```

在简派目录打开终端，运行：

```bash
npm start
```

进入后使用 `/login` 登录模型服务商，再使用 `/model` 选择模型。登录菜单、设置和操作提示已中文化；命令本身仍保留英文，兼容 Pi 原有操作习惯。

**现在这台电脑已经安装依赖并完成构建，可以直接 `npm start`。**

不登录也能查看真实工具演示，不调用 AI，不消耗模型额度：

```bash
npm run demo
```

在其他项目里使用时，从那个项目的目录运行启动器：

```bash
node /你的路径/简派/bin/jianpai.mjs
```

启动器保留当前工作目录，不会把其他项目的操作切换到简派目录。

项目已提供正式命令入口：`简派` 和 `jianpai`。公开安装：

```bash
curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh | bash
简派
```

安装与分发方案见 [安装与分发](docs/install.md)。后续可将 nodeble 域名配置为同路径镜像或跳转。

## 不影响现有 Pi

- 不修改全局安装的 `pi`，原来的 `pi` 命令照常使用。
- 默认使用独立用户配置 `~/.jianpai/agent/`，不会复制你的密钥或会话；首次需要重新登录。
- 如需自定义配置位置，可设置 `JIANPAI_CODING_AGENT_DIR`。
- 项目资源仍使用 `.pi/`，兼容 Pi 项目布局及信任流程。
- 启动器默认关闭上游版本检查和安装统计，不替你执行全局更新。模型请求及你主动执行的软件包操作仍可能联网。
- 停用简派只需退出并重新运行原来的 `pi`，无需卸载或恢复全局配置。

## 汉化原则

只改显示，不改工具行为。不翻译文件路径、代码、原始命令、原始日志、模型名称和协议字段。比如原始日志里的 `write` 不会被全文替换；只有工具标题会显示“撰写”。

工具标题支持简短命令说明：`执行命令 $ ls（列出文件） -la`、`执行命令 $ rg（搜索内容） "关键词"`。只识别开头的裸 `ls` / `rg`，不解析组合命令后半段、路径或脚本；真实执行参数及原始日志不变。括号是显示说明，复制执行时请使用不带说明的原始命令。源码更新后需退出简派，在普通终端构建并重启才能生效。

开发接续以 `TODO.md` 为准：已完成打勾，待验证单列；每次先读待办，没有可推进事项时询问用户需求。

当前版本不增加额外解释卡片、风险拦截或新工作流程，也不是安全沙箱。先保持 Pi 的样子，把中文体验做好。

## 开发

```bash
npm run build     # 从固定版本 Pi 生成中文构建
npm run check     # 检查语法、上游指纹、构建与执行模块
npm test          # 本地测试，不调用付费模型
npm run audit:zh  # 生成英文片段人工复核清单
npm run package:release # 生成可上传到网站的源码安装包
```

- `locales/`：按文件组织的中文词条、显示补丁与版本指纹。
- `src/display-values.js`：设置值和思考强度的中文显示。
- `bin/jianpai.mjs`：独立启动器。
- `build/`：生成的 Pi 副本，不提交到 Git。
- `build/translation-report.json`：实际翻译条目清单，不代表全项目覆盖率。

上游版本或文件指纹变化时，构建会停止，不会悄悄套用旧补丁。

## 文档与许可

[汉化范围与验证](docs/localization.md) · [产品需求](docs/product.md) · [技术方案](docs/architecture.md) · [后续清单](TODO.md)

简派是独立项目，不是 Pi 官方中文版本。简派自身使用 MIT 许可证，见 [LICENSE](LICENSE)。Pi 上游使用 MIT 许可证，版权声明保留于 [THIRD_PARTY_LICENSES/Pi-MIT.txt](THIRD_PARTY_LICENSES/Pi-MIT.txt)。
