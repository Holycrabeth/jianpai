# 发布清单

当前公开下载路径约定：

```text
https://nodeble.com/jianpai/install.sh
https://nodeble.com/jianpai/jianpai-latest.tar.gz
```

## 本地发布文件

```bash
npm test
npm run check
npm run package:release
```

需要上传：

```text
scripts/install.sh -> /jianpai/install.sh
dist/jianpai-latest.tar.gz -> /jianpai/jianpai-latest.tar.gz
```

## 上传后验证

用真实 URL 做隔离安装，不污染真实用户配置：

```bash
tmp="$(mktemp -d)"
JIANPAI_INSTALL_ROOT="$tmp/home/.jianpai" \
JIANPAI_BIN_DIR="$tmp/bin" \
bash -c "$(curl -fsSL https://nodeble.com/jianpai/install.sh)"
"$tmp/bin/简派" --version
"$tmp/bin/jianpai" --version
```

期望输出：

```text
0.85.0
0.85.0
```

## 目前状态

- MIT 许可证已确认。
- 本机与 macmini 的本地 tar.gz 隔离安装已通过。
- `nodeble.com` 当前解析到 `213.249.67.10`，但 HTTP/HTTPS 探测超时；还需要确认域名实际托管位置或 DNS。
