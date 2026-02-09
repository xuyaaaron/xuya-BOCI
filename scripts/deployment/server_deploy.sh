#!/bin/bash
# Nginx优化自动部署脚本

echo "========================================================================"
echo "🚀 开始部署Nginx性能优化"
echo "========================================================================"
echo ""

# 显示当前目录和文件
echo "📁 检查文件..."
if [ -f "/tmp/nginx.conf" ]; then
    echo "✓ 找到配置文件: /tmp/nginx.conf"
else
    echo "✗ 配置文件不存在，需要先上传"
    exit 1
fi
echo ""

# 步骤1: 备份当前配置
echo "📦 步骤 1/5: 备份当前Nginx配置..."
BACKUP_FILE="/etc/nginx/conf.d/my_site.conf.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp /etc/nginx/conf.d/my_site.conf "$BACKUP_FILE"
if [ $? -eq 0 ]; then
    echo "✓ 配置已备份到: $BACKUP_FILE"
else
    echo "✗ 备份失败"
    exit 1
fi
echo ""

# 步骤2: 应用新配置
echo "⚙️  步骤 2/5: 应用新的Nginx配置..."
sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf
if [ $? -eq 0 ]; then
    echo "✓ 新配置已应用"
else
    echo "✗ 应用配置失败"
    exit 1
fi
echo ""

# 步骤3: 测试配置
echo "🧪 步骤 3/5: 测试Nginx配置..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✓ Nginx配置测试通过"
else
    echo "✗ Nginx配置测试失败！正在回滚..."
    sudo cp "$BACKUP_FILE" /etc/nginx/conf.d/my_site.conf
    echo "已回滚到备份配置"
    exit 1
fi
echo ""

# 步骤4: 重启Nginx
echo "🔄 步骤 4/5: 重启Nginx服务..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "✓ Nginx已成功重启"
else
    echo "✗ Nginx重启失败"
    sudo systemctl status nginx
    exit 1
fi
echo ""

# 步骤5: 验证GZIP
echo "✓ 步骤 5/5: 验证GZIP压缩..."
sleep 2  # 等待Nginx完全启动

# 检查GZIP
GZIP_CHECK=$(curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json 2>/dev/null | grep -i "content-encoding: gzip")

if [ ! -z "$GZIP_CHECK" ]; then
    echo "✓ GZIP压缩已成功启用！"
    echo "  $GZIP_CHECK"
else
    echo "⚠️  未检测到GZIP压缩，可能需要等待片刻..."
fi
echo ""

# 显示文件大小对比
echo "📊 文件大小对比..."
echo "不压缩："
curl -o /dev/null -s -w 'Size: %{size_download} bytes (%.2f MB)\n' http://110.40.129.184/static_data.json | awk '{printf "%s %.2f MB\n", $1, $3/1024/1024}'

echo "GZIP压缩后："
curl -H "Accept-Encoding: gzip" -o /dev/null -s -w 'Size: %{size_download} bytes (%.2f MB)\n' http://110.40.129.184/static_data.json | awk '{printf "%s %.2f MB\n", $1, $3/1024/1024}'
echo ""

echo "========================================================================"
echo "✅ 部署完成！"
echo "========================================================================"
echo ""
echo "📋 部署摘要："
echo "  - 备份文件: $BACKUP_FILE"
echo "  - 新配置: /etc/nginx/conf.d/my_site.conf"
echo "  - GZIP状态: $([ ! -z "$GZIP_CHECK" ] && echo '已启用 ✓' || echo '待确认 ⚠️')"
echo ""
echo "🌐 验证方法："
echo "  1. 访问: http://110.40.129.184/"
echo "  2. 打开开发者工具 (F12) -> Network"
echo "  3. 刷新页面，查看 static_data.json 大小"
echo "  4. 应该显示约 2-3MB（而不是25.88MB）"
echo ""
