import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

// Read data, never source a shell script. Only import the two notification fields.
export async function loadTelegramEnvironment(agentDir, environment = process.env) {
  const result = { ...environment };
  if (result.JIANPAI_TELEGRAM_NOTIFY === '0') return result;
  let values;
  try {
    values = parseEnv(await readFile(join(agentDir, 'telegram.env'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return result;
    // Do not expose file contents or parser errors containing credentials.
    throw new Error(`无法读取 Telegram 配置 telegram.env（${error.code ?? '格式错误'}）`);
  }
  for (const suffix of ['BOT_TOKEN', 'CHAT_ID']) {
    const key = `JIANPAI_TELEGRAM_${suffix}`;
    const alias = `TELEGRAM_${suffix}`;
    // Explicit environment settings (including the generic aliases) win over the file.
    if (!result[key]?.trim() && !result[alias]?.trim() && values[key]?.trim()) {
      result[key] = values[key].trim();
    }
  }
  return result;
}
