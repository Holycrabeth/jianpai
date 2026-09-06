#!/usr/bin/env bash
set -euo pipefail

SOURCE_URL="${JIANPAI_SOURCE_URL:-https://github.com/Holycrabeth/jianpai/releases/latest/download/jianpai-latest.tar.gz}"
INSTALL_ROOT="${JIANPAI_INSTALL_ROOT:-$HOME/.jianpai}"
BIN_DIR="${JIANPAI_BIN_DIR:-$HOME/.local/bin}"
VERSION_NAME="${JIANPAI_VERSION_NAME:-$(date +%Y%m%d%H%M%S)}"
INSTALL_DIR="$INSTALL_ROOT/versions/$VERSION_NAME"
CURRENT_LINK="$INSTALL_ROOT/current"

info() { printf '简派安装器：%s\n' "$*"; }
fail() { printf '简派安装器：%s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "缺少命令：$1"; }

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  for candidate in /opt/homebrew/bin /usr/local/bin; do
    if [ -x "$candidate/node" ] || [ -x "$candidate/npm" ]; then
      PATH="$candidate:$PATH"
    fi
  done
fi

need node
need npm
need tar

node - <<'NODE' || fail '需要 Node.js 22.19 或更新版本。请先安装新版 Node.js。'
const [major, minor] = process.versions.node.split('.').map(Number);
process.exit(major > 22 || (major === 22 && minor >= 19) ? 0 : 1);
NODE

if command -v curl >/dev/null 2>&1; then
  download() { curl -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null 2>&1; then
  download() { wget -qO "$2" "$1"; }
else
  fail '缺少 curl 或 wget，无法下载简派。'
fi

tmp="$(mktemp -d)"
cleanup() { rm -rf "$tmp"; }
trap cleanup EXIT

archive="$tmp/jianpai.tar.gz"
extract_dir="$tmp/src"
mkdir -p "$extract_dir" "$INSTALL_ROOT/versions" "$BIN_DIR"

info "下载 $SOURCE_URL"
download "$SOURCE_URL" "$archive"

info '解压安装包'
tar -xzf "$archive" -C "$extract_dir"

package_file="$(find "$extract_dir" -maxdepth 2 -name package.json -print -quit)"
[ -n "$package_file" ] || fail '安装包格式不正确：没有找到 package.json。'
src_dir="$(dirname "$package_file")"
[ -f "$src_dir/package.json" ] || fail '安装包格式不正确：没有找到 package.json。'

info "安装到 $INSTALL_DIR"
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
( shopt -s dotglob nullglob; cp -R "$src_dir"/* "$INSTALL_DIR"/ )

cd "$INSTALL_DIR"
info '安装依赖（按锁文件，不运行依赖安装脚本）'
npm ci --ignore-scripts
info '生成中文构建'
npm run build

ln -sfn "$INSTALL_DIR" "$CURRENT_LINK"
chmod +x "$INSTALL_DIR/bin/jianpai.mjs"

for command_name in jianpai 简派; do
  cat > "$BIN_DIR/$command_name" <<EOF
#!/usr/bin/env bash
set -euo pipefail
if ! command -v node >/dev/null 2>&1; then
  for candidate in /opt/homebrew/bin /usr/local/bin; do
    if [ -x "\$candidate/node" ]; then
      PATH="\$candidate:\$PATH"
    fi
  done
fi
exec node "$CURRENT_LINK/bin/jianpai.mjs" "\$@"
EOF
  chmod +x "$BIN_DIR/$command_name"
done

info '安装完成。'
info "命令已放到：$BIN_DIR/简派 和 $BIN_DIR/jianpai"
case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    info "注意：$BIN_DIR 还不在 PATH 里。请把下面这一行加入 ~/.zshrc 或 ~/.bashrc："
    printf 'export PATH="%s:$PATH"\n' "$BIN_DIR"
    ;;
esac
info '现在可以输入：简派'
