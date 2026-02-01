#!/bin/bash
# 服务器数据更新脚本
# 执行 git pull 并重新生成静态数据

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始更新服务器数据"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# 1. 从 GitHub 拉取最新代码
echo "📥 正在从 GitHub 拉取最新代码..."
git pull origin main

# 2. 重新生成静态数据（如果需要）
echo "📸 正在生成静态数据快照..."
cd "$PROJECT_ROOT"
python3 generate_static.py

echo "=========================================="
echo "✅ 更新完成"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
