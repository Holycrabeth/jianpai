import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const DEFAULT_TIMEOUT_MS = 10_000;

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function shorten(text: string, max = 200): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1)}…`;
}

async function sendTelegramMessage(text: string, signal?: AbortSignal): Promise<void> {
  const token = env("JIANPAI_TELEGRAM_BOT_TOKEN") ?? env("TELEGRAM_BOT_TOKEN");
  const chatId = env("JIANPAI_TELEGRAM_CHAT_ID") ?? env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(env("JIANPAI_TELEGRAM_TIMEOUT_MS")) || DEFAULT_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Telegram 通知失败：HTTP ${response.status}${body ? ` ${body}` : ""}`);
    }
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export default function telegramDoneExtension(pi: ExtensionAPI): void {
  if (env("JIANPAI_TELEGRAM_NOTIFY") === "0") return;

  let lastPrompt = "";
  let startedAt = 0;
  let hasActiveRun = false;

  pi.on("before_agent_start", async (event) => {
    lastPrompt = event.prompt ?? "";
    startedAt = Date.now();
    hasActiveRun = true;
  });

  pi.on("agent_settled", async (_event, ctx: ExtensionContext) => {
    if (!hasActiveRun) return;
    hasActiveRun = false;

    const durationSeconds = startedAt > 0 ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : undefined;
    const title = pi.getSessionName?.() ?? undefined;
    const lines = [
      "✅ <b>简派干完了</b>",
      title ? `会话：${escapeHtml(title)}` : undefined,
      `目录：<code>${escapeHtml(ctx.cwd)}</code>`,
      lastPrompt ? `任务：${escapeHtml(shorten(lastPrompt))}` : undefined,
      durationSeconds ? `耗时：约 ${durationSeconds} 秒` : undefined,
    ].filter((line): line is string => Boolean(line));

    try {
      await sendTelegramMessage(lines.join("\n"), ctx.signal);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.ui.notify(`Telegram 通知发送失败：${message}`, "warning");
    }
  });
}
