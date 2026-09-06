# 模型更新机制

简派固定 Pi `0.85.0` 作为稳定底座。模型提供商发布新模型时，优先通过简派自己的补丁版本发布，例如 `0.1.1`、`0.1.2`，不为了模型列表频繁升级 Pi。

## 用户怎么更新模型

用户重新运行公开安装命令即可更新到最新简派版本：

```bash
curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh | bash
```

安装后：

```bash
简派
```

## 简派内置模型补丁

简派维护自己的内置模型增量文件：

```text
models/jianpai.models.json
```

启动器每次运行前会生成合并后的模型配置：

```text
~/.jianpai/agent/generated/jianpai-models.json
```

然后让底层 Pi 读取这个合并文件。

合并顺序：

1. 简派内置模型补丁：`models/jianpai.models.json`
2. 用户自己的模型配置：`~/.jianpai/agent/models.json`

用户配置优先。如果同一个 provider / 同一个模型 `id` 同时存在，用户自己的设置会覆盖简派内置设置。

## 新增模型发布流程

如果模型提供商发布新模型：

1. 修改 `models/jianpai.models.json`。
2. 如有必要，补充 `docs/models.md` 示例。
3. 运行测试：

```bash
npm test
```

4. 在普通终端重建并检查：

```bash
npm run build
npm run check
npm test
```

5. 升补丁版本并发布，例如：

```bash
npm version patch --no-git-tag-version
npm run package:release
```

6. 创建新的 GitHub Release，上传 `dist/jianpai-latest.tar.gz`。

## 用户自定义模型仍然可用

用户可以继续写自己的：

```text
~/.jianpai/agent/models.json
```

例如本地 Ollama：

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": false
      },
      "models": [
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}
```

打开 `/model` 时会重新加载模型配置。简派不会覆盖用户自己的 `models.json`。
