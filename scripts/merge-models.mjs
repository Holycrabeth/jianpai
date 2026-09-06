#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readJsonIfExists(path) {
  if (!path || !existsSync(path)) return {};
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new Error(`无法读取模型配置 ${path}：${error instanceof Error ? error.message : String(error)}`);
  }
}

function mergeModelArrays(base = [], override = []) {
  const result = Array.isArray(base) ? structuredClone(base) : [];
  for (const model of Array.isArray(override) ? override : []) {
    if (!isObject(model) || typeof model.id !== 'string') continue;
    const index = result.findIndex(item => isObject(item) && item.id === model.id);
    if (index >= 0) result[index] = mergeObjects(result[index], model);
    else result.push(structuredClone(model));
  }
  return result;
}

function mergeObjects(base, override) {
  const result = isObject(base) ? structuredClone(base) : {};
  if (!isObject(override)) return result;
  for (const [key, value] of Object.entries(override)) {
    if (key === 'models') result[key] = mergeModelArrays(result[key], value);
    else if (isObject(value) && isObject(result[key])) result[key] = mergeObjects(result[key], value);
    else result[key] = structuredClone(value);
  }
  return result;
}

export function mergeModelConfigs(...configs) {
  return configs.reduce((merged, config) => mergeObjects(merged, config), {});
}

export async function writeMergedModels({ builtinPath = join(root, 'models/jianpai.models.json'), userPath, outputPath }) {
  if (!outputPath) throw new Error('缺少 outputPath');
  const builtin = await readJsonIfExists(builtinPath);
  const user = await readJsonIfExists(userPath);
  const merged = mergeModelConfigs(builtin, user);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(merged, null, 2) + '\n');
  return { outputPath, builtinProviders: Object.keys(builtin.providers ?? {}).length, userProviders: Object.keys(user.providers ?? {}).length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [userPath, outputPath, builtinPath] = process.argv.slice(2);
  await writeMergedModels({ userPath, outputPath, builtinPath });
}
