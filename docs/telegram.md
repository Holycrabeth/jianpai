# Telegram 完成通知

用途：当简派完成一次用户任务、不会再自动继续运行时，给 Telegram 发一条消息，提醒用户回来继续下一步。

## 为什么用 `agent_settled`

Pi 有两个相近事件：

- `agent_end`：一次底层 agent run 结束，但后面可能还有自动重试、自动压缩后重试，或排队的 follow-up。
- `agent_settled`：Pi 已经空闲，不会自动继续。

完成通知使用 `agent_settled`，避免太早通知。

## 配置

需要先创建 Telegram Bot，并拿到：

- Bot Token
- Chat ID

安装器会在可交互终端里询问是否配置：

```text
为了确保您知道模型是否完工，建议添加 Telegram 通知机器人，方便您随时了解模型工作完成与否。
是否现在配置 Telegram 完成通知？[y/N]
```

选择 `y` 后，输入自己的 Chat ID 和 Bot Token 即可。配置会保存到用户本机 `~/.jianpai/agent/telegram.env`，不会写进简派源码或发布包。

从 `0.1.2` 起，启动器直接读取这个文件，不再依赖 shell 配置是否生效。自定义 `JIANPAI_CODING_AGENT_DIR` 时，只读取该目录下的 `telegram.env`。显式环境变量（包括下方通用别名）优先于文件；文件仅按数据解析，不执行其中的 shell 命令，也不导入无关变量。读取失败会在终端提示，但不阻止简派启动。

也可以手动在 shell 配置里加入：

```bash
export JIANPAI_TELEGRAM_BOT_TOKEN="你的 bot token"
export JIANPAI_TELEGRAM_CHAT_ID="你的 chat id"
```

新开终端后启动：

```bash
简派
```

也可以只对当前一次启动生效：

```bash
JIANPAI_TELEGRAM_BOT_TOKEN="你的 bot token" \
JIANPAI_TELEGRAM_CHAT_ID="你的 chat id" \
简派
```

## 没收到通知时

- `0.1.1` 只读取环境变量：即使安装器已保存文件，旧终端 / 未加载 shell 配置的启动环境仍可能静默跳过通知。升级 `0.1.2` 并退出重启后才会使用新的读取逻辑，`/reload` 不能重新运行启动器。
- 检查是否设置了 `JIANPAI_TELEGRAM_NOTIFY=0`，以及当前配置目录是否包含自己的 `telegram.env`。
- Telegram 发送失败时界面会提示；本地模拟测试通过不代表真实网络或机器人权限已验证。

## 关闭

```bash
JIANPAI_TELEGRAM_NOTIFY=0 简派
```

## 其他环境变量

- `TELEGRAM_BOT_TOKEN`：兼容通用 Telegram bot token 环境变量。
- `TELEGRAM_CHAT_ID`：兼容通用 Telegram chat id 环境变量。
- `JIANPAI_TELEGRAM_TIMEOUT_MS`：发送超时时间，默认 10000 毫秒。

## 隐私说明

通知内容包含：

- 当前工作目录
- 用户任务的简短摘要
- 大致耗时
- 会话名（如果设置过）

不会发送代码差异、文件内容、模型回复全文或密钥。Bot Token 不写入项目源码，建议只放在用户自己的 shell 配置或密钥管理工具里。
