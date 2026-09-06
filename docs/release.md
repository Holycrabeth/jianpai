# 发布清单

当前公开下载主渠道：GitHub。

```text
https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh
https://github.com/Holycrabeth/jianpai/releases/latest/download/jianpai-latest.tar.gz
```

nodeble 域名恢复后，可额外镜像或跳转：

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

需要上传到 GitHub Release：

```text
dist/jianpai-latest.tar.gz
```

## 上传后验证

用真实 URL 做隔离安装，不污染真实用户配置：

```bash
tmp="$(mktemp -d)"
JIANPAI_INSTALL_ROOT="$tmp/home/.jianpai" \
JIANPAI_BIN_DIR="$tmp/bin" \
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Holycrabeth/jianpai/main/scripts/install.sh)"
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
- GitHub 公开仓库：`https://github.com/Holycrabeth/jianpai`。
- `nodeble.com` 当前解析到 `213.249.67.10`，但 HTTP/HTTPS/SSH 探测不可用；暂不作为主发布渠道。
