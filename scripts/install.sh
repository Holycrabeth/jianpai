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

path_entry_line() {
  printf 'export PATH="%s:$PATH"' "$BIN_DIR"
}

append_path_to_file() {
  local profile_file="$1"
  local marker='# 简派命令：让任意目录都能输入「简派」启动'
  local line
  line="$(path_entry_line)"
  mkdir -p "$(dirname "$profile_file")"
  touch "$profile_file"
  if grep -Fq "$BIN_DIR" "$profile_file"; then
    return 0
  fi
  {
    printf '\n%s\n' "$marker"
    printf '%s\n' "$line"
  } >> "$profile_file"
  info "已写入 PATH 配置：$profile_file"
}

escape_double_quoted() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "$value"
}

append_source_to_file() {
  local profile_file="$1"
  local source_file="$2"
  local marker='# 简派 Telegram 完成通知'
  local escaped
  escaped="$(escape_double_quoted "$source_file")"
  mkdir -p "$(dirname "$profile_file")"
  touch "$profile_file"
  if grep -Fq "$source_file" "$profile_file"; then
    return 0
  fi
  {
    printf '\n%s\n' "$marker"
    printf '[ -f "%s" ] && source "%s"\n' "$escaped" "$escaped"
  } >> "$profile_file"
  info "已写入 Telegram 通知配置加载项：$profile_file"
}

for_shell_profiles() {
  local callback="$1"
  shift
  case "${SHELL:-}" in
    */zsh)
      "$callback" "$HOME/.zshrc" "$@"
      "$callback" "$HOME/.zprofile" "$@"
      ;;
    */bash)
      "$callback" "$HOME/.bashrc" "$@"
      "$callback" "$HOME/.bash_profile" "$@"
      ;;
    *)
      "$callback" "$HOME/.profile" "$@"
      ;;
  esac
}

ensure_command_on_path() {
  case ":$PATH:" in
    *":$BIN_DIR:"*) return 0 ;;
  esac

  if [ "${JIANPAI_UPDATE_SHELL:-1}" = "0" ]; then
    info "注意：$BIN_DIR 还不在 PATH 里。请手动加入：$(path_entry_line)"
    return 0
  fi

  for_shell_profiles append_path_to_file
  info '新开的终端窗口可直接输入：简派'
  info "当前终端如需立刻使用，请先运行：$(path_entry_line)"
}

configure_telegram_notifications() {
  if [ "${JIANPAI_CONFIGURE_TELEGRAM:-}" = "0" ]; then
    return 0
  fi

  local enable="${JIANPAI_CONFIGURE_TELEGRAM:-}"
  if [ -z "$enable" ]; then
    if [ ! -r /dev/tty ] || [ ! -w /dev/tty ]; then
      info '未检测到可交互终端，跳过 Telegram 完成通知配置。以后可按 docs/telegram.md 手动配置。'
      return 0
    fi
    printf '\n为了确保您知道模型是否完工，建议添加 Telegram 通知机器人，方便您随时了解模型工作完成与否。\n' > /dev/tty
    printf '是否现在配置 Telegram 完成通知？[y/N] ' > /dev/tty
    read -r enable < /dev/tty || enable=""
  fi

  case "$enable" in
    y|Y|yes|YES|1|true|TRUE) ;;
    *)
      info '已跳过 Telegram 完成通知配置。'
      return 0
      ;;
  esac

  [ -r /dev/tty ] || fail '当前没有可交互终端，无法读取 Telegram 配置。'
  local chat_id bot_token env_file
  printf '请输入 Telegram Chat ID：' > /dev/tty
  read -r chat_id < /dev/tty || chat_id=""
  printf '请输入 Telegram Bot Token：' > /dev/tty
  read -r bot_token < /dev/tty || bot_token=""
  [ -n "$chat_id" ] || fail 'Telegram Chat ID 不能为空。'
  [ -n "$bot_token" ] || fail 'Telegram Bot Token 不能为空。'

  env_file="$INSTALL_ROOT/agent/telegram.env"
  mkdir -p "$(dirname "$env_file")"
  umask 077
  cat > "$env_file" <<EOF
export JIANPAI_TELEGRAM_CHAT_ID="$(escape_double_quoted "$chat_id")"
export JIANPAI_TELEGRAM_BOT_TOKEN="$(escape_double_quoted "$bot_token")"
EOF
  chmod 600 "$env_file"
  for_shell_profiles append_source_to_file "$env_file"
  info "Telegram 完成通知已配置：$env_file"
  info '新开的终端启动简派后，agent 干完会发送 Telegram 提醒。'
}

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
ensure_command_on_path
configure_telegram_notifications
info '现在可以输入：简派'
