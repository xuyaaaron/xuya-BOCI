# Nginx性能优化自动部署脚本
# 使用方法: .\deploy_nginx.ps1

$ErrorActionPreference = "Continue"

# 配置
$SERVER = "110.40.129.184"
$USER = "deploy"
$PASSWORD = "AAbb123456789"

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🚀 Nginx性能优化自动部署" -ForegroundColor Green  
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

# 步骤1: 检查nginx.conf
Write-Host "📋 步骤 1/6: 检查配置文件..." -ForegroundColor Yellow
if (Test-Path "nginx.conf") {
    Write-Host "✓ 找到 nginx.conf" -ForegroundColor Green
}
else {
    Write-Host "✗ 未找到 nginx.conf" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 步骤2: 上传配置文件
Write-Host "📤 步骤 2/6: 上传配置文件到服务器..." -ForegroundColor Yellow
Write-Host "命令: scp nginx.conf ${USER}@${SERVER}:/tmp/" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  需要手动输入密码: $PASSWORD" -ForegroundColor Yellow
Write-Host ""

$upload = Read-Host "是否继续上传配置文件? (y/n)"
if ($upload -eq 'y' -or $upload -eq 'Y') {
    scp nginx.conf "${USER}@${SERVER}:/tmp/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 文件上传成功" -ForegroundColor Green
    }
    else {
        Write-Host "✗ 文件上传失败" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "⏭️  跳过文件上传" -ForegroundColor Yellow
}
Write-Host ""

# 步骤3-6: 创建服务器端执行脚本
Write-Host "📝 步骤 3/6: 创建服务器端部署脚本..." -ForegroundColor Yellow

$deployScript = @"
#!/bin/bash
set -e

echo "========================================================================"
echo "开始Nginx配置部署"
echo "========================================================================"
echo ""

echo "步骤 1/4: 备份当前配置..."
sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.\$(date +%Y%m%d_%H%M%S)
echo "✓ 配置已备份"
echo ""

echo "步骤 2/4: 应用新配置..."
sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf
echo "✓ 新配置已应用"
echo ""

echo "步骤 3/4: 测试Nginx配置..."
sudo nginx -t
if [ \$? -ne 0 ]; then
    echo "✗ Nginx配置测试失败！正在回滚..."
    sudo cp /etc/nginx/conf.d/my_site.conf.backup.* /etc/nginx/conf.d/my_site.conf 2>/dev/null | tail -1
    exit 1
fi
echo "✓ 配置测试通过"
echo ""

echo "步骤 4/4: 重启Nginx..."
sudo systemctl reload nginx
if [ \$? -ne 0 ]; then
    echo "✗ Nginx重启失败"
    exit 1
fi
echo "✓ Nginx已重启"
echo ""

echo "========================================================================"
echo "验证GZIP压缩..."
echo "========================================================================"
GZIP_CHECK=\$(curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json 2>/dev/null | grep -i "content-encoding: gzip")
if [ ! -z "\$GZIP_CHECK" ]; then
    echo "✓ GZIP压缩已成功启用！"
else
    echo "⚠️  未检测到GZIP，可能需要等待几秒..."
fi
echo ""

echo "========================================================================"
echo "✓ 部署完成！"
echo "========================================================================"
echo ""
echo "验证命令："
echo "curl -H 'Accept-Encoding: gzip' -I http://110.40.129.184/static_data.json | grep -i content-encoding"
echo ""
"@

$deployScript | Out-File -FilePath "deploy_server.sh" -Encoding UTF8
Write-Host "✓ 创建服务器端脚本: deploy_server.sh" -ForegroundColor Green
Write-Host ""

# 步骤4: 上传部署脚本
Write-Host "📤 步骤 4/6: 上传部署脚本..." -ForegroundColor Yellow
$uploadScript = Read-Host "是否上传部署脚本到服务器? (y/n)"
if ($uploadScript -eq 'y' -or $uploadScript -eq 'Y') {
    scp deploy_server.sh "${USER}@${SERVER}:/tmp/"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 部署脚本上传成功" -ForegroundColor Green
    }
    else {
        Write-Host "✗ 部署脚本上传失败" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "⏭️  跳过脚本上传" -ForegroundColor Yellow
}
Write-Host ""

# 步骤5: SSH连接执行
Write-Host "🔌 步骤 5/6: SSH连接并执行部署..." -ForegroundColor Yellow
Write-Host ""
Write-Host "需要执行的命令如下：" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh ${USER}@${SERVER}" -ForegroundColor White
Write-Host "# 输入密码: $PASSWORD" -ForegroundColor Gray
Write-Host ""
Write-Host "连接后执行：" -ForegroundColor Cyan
Write-Host "chmod +x /tmp/deploy_server.sh" -ForegroundColor White
Write-Host "/tmp/deploy_server.sh" -ForegroundColor White
Write-Host ""

$sshNow = Read-Host "是否现在连接SSH? (y/n)"
if ($sshNow -eq 'y' -or $sshNow -eq 'Y') {
    Write-Host ""
    Write-Host "正在连接服务器..." -ForegroundColor Yellow
    Write-Host "密码: $PASSWORD" -ForegroundColor Yellow
    Write-Host ""
    ssh "${USER}@${SERVER}"
}
else {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host ("=" * 69) -ForegroundColor Cyan
    Write-Host "⏸️  部署暂停" -ForegroundColor Yellow
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host ("=" * 69) -ForegroundColor Cyan
    Write-Host ""
    Write-Host "要完成部署，请手动执行：" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. SSH连接: ssh ${USER}@${SERVER}" -ForegroundColor White
    Write-Host "2. 执行脚本: chmod +x /tmp/deploy_server.sh && /tmp/deploy_server.sh" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "📚 详细文档请查看: NGINX_DEPLOY_GUIDE.md" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
