import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeModelConfigs } from '../scripts/merge-models.mjs';

test('简派内置模型增量与用户 models.json 合并，用户配置优先', () => {
  const builtin = {
    providers: {
      openai: {
        models: [
          { id: 'gpt-new', name: 'Built-in name', reasoning: true, input: ['text'] },
        ],
        modelOverrides: {
          'gpt-old': { contextWindow: 200000 },
        },
      },
    },
  };
  const user = {
    providers: {
      openai: {
        models: [
          { id: 'gpt-new', name: 'User name', maxTokens: 32000 },
          { id: 'user-only', name: 'User only' },
        ],
        modelOverrides: {
          'gpt-old': { maxTokens: 16000 },
        },
      },
      local: {
        baseUrl: 'http://localhost:11434/v1',
        api: 'openai-completions',
        apiKey: 'ollama',
        models: [{ id: 'qwen-local' }],
      },
    },
  };
  const merged = mergeModelConfigs(builtin, user);
  assert.deepEqual(merged.providers.openai.models, [
    { id: 'gpt-new', name: 'User name', reasoning: true, input: ['text'], maxTokens: 32000 },
    { id: 'user-only', name: 'User only' },
  ]);
  assert.deepEqual(merged.providers.openai.modelOverrides['gpt-old'], { contextWindow: 200000, maxTokens: 16000 });
  assert.equal(merged.providers.local.models[0].id, 'qwen-local');
});
