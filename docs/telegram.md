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

然后在 shell 配置里加入：

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
