# 安装与分发

目标：以后用户可以用一条命令安装简派，安装后在任意目录输入 `简派` 或 `jianpai` 启动。

## 用户安装命令

当前公开安装命令：

```bash
curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh | bash
```

nodeble 域名恢复后，也可以镜像为：

```bash
curl -fsSL https://nodeble.com/jianpai/install.sh | bash
```

安装脚本会：

1. 检查 Node.js 版本，要求 22.19 或更新版本。
2. 默认下载 GitHub Release 上的 `jianpai-latest.tar.gz`。
3. 安装到 `~/.jianpai/versions/<时间戳>/`。
4. 执行 `npm ci --ignore-scripts` 和 `npm run build`。
5. 创建命令链接：
   - `~/.local/bin/简派`
   - `~/.local/bin/jianpai`
6. 如果 `~/.local/bin` 不在 `PATH` 里，自动写入常用 shell 配置，让新开的终端在任意目录都能输入 `简派` 启动。
7. 在可交互终端里询问是否配置 Telegram 完成通知。用户选择启用后，需要输入自己的 Telegram Chat ID 和 Bot Token；安装器会保存到用户本机 `~/.jianpai/agent/telegram.env`，不会写入项目或发布包。

默认会按当前 shell 写入这些文件之一：zsh 写入 `~/.zshrc` 和 `~/.zprofile`，bash 写入 `~/.bashrc` 和 `~/.bash_profile`，其他 shell 写入 `~/.profile`。如果不想让安装器修改 shell 配置，可以这样安装：

```bash
curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh | JIANPAI_UPDATE_SHELL=0 bash
```

这种情况下需要手动把 `~/.local/bin` 加入 `PATH`。

如果不想在安装时询问 Telegram 通知，可以这样跳过：

```bash
curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh | JIANPAI_CONFIGURE_TELEGRAM=0 bash
```

如果想在自动化脚本里强制进入 Telegram 配置流程，可以设置 `JIANPAI_CONFIGURE_TELEGRAM=1`；但这仍需要可交互终端来输入 Chat ID 和 Bot Token。

## 发布准备

在项目目录生成可上传的源码包：

```bash
npm run package:release
```

输出文件：

```text
dist/jianpai-latest.tar.gz
```

需要上传到 GitHub Release：

```text
jianpai-latest.tar.gz
```

安装脚本直接使用仓库里的 `scripts/install.sh`。

如果 nodeble 域名恢复，也可以额外上传为：

```text
https://nodeble.com/jianpai/install.sh
https://nodeble.com/jianpai/jianpai-latest.tar.gz
```

## 本地测试安装器

可以不经过网站，直接用本地压缩包测试：

```bash
npm run package:release
JIANPAI_SOURCE_URL="file://$PWD/dist/jianpai-latest.tar.gz" bash scripts/install.sh
```

为了不影响真实安装目录，也可以指定临时位置：

```bash
tmp="$(mktemp -d)"
JIANPAI_INSTALL_ROOT="$tmp/home/.jianpai" \
JIANPAI_BIN_DIR="$tmp/bin" \
JIANPAI_SOURCE_URL="file://$PWD/dist/jianpai-latest.tar.gz" \
bash scripts/install.sh
"$tmp/bin/简派" --version
```

## 注意

- `简派` 是中文命令名，macOS / Linux 通常可用；同时保留 `jianpai`，方便英文环境和脚本使用。
- 安装后如果当前终端还识别不到 `简派`，请新开一个终端窗口，或先运行 `export PATH="$HOME/.local/bin:$PATH"`。
- 安装脚本会运行 `npm ci --ignore-scripts`，不运行依赖安装脚本，降低安装阶段的不可控行为。
- 当前开源许可：MIT。
- 真正发布前需要确认域名托管位置和更新策略。
