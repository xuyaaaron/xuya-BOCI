# 服务器部署步骤

$server = "110.40.129.184"
$user = "deploy"
$password = "AAbb123456789"

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host "🚀 开始部署Nginx性能优化" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host ""

# 步骤1: 准备本地nginx配置文件
Write-Host "步骤 1/5: 检查Nginx配置文件..." -ForegroundColor Yellow
$nginxConf = "nginx.conf"
if (Test-Path $nginxConf) {
    Write-Host "✓ 找到配置文件: $nginxConf" -ForegroundColor Green
} else {
    Write-Host "✗ 未找到配置文件" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 步骤2: 使用scp上传文件
Write-Host "步骤 2/5: 上传配置文件到服务器..." -ForegroundColor Yellow
Write-Host "执行命令: scp $nginxConf ${user}@${server}:/tmp/" -ForegroundColor Gray
Write-Host "密码: AAbb123456789" -ForegroundColor Gray
Write-Host ""
Write-Host "请手动执行以下命令（需要输入密码）：" -ForegroundColor Cyan
Write-Host "scp $nginxConf ${user}@${server}:/tmp/" -ForegroundColor White
Write-Host ""

# 步骤3-5: SSH连接执行命令
Write-Host "步骤 3-5: SSH连接服务器并执行部署" -ForegroundColor Yellow
Write-Host "请手动执行以下命令（需要输入密码）：" -ForegroundColor Cyan
Write-Host "ssh ${user}@${server}" -ForegroundColor White
Write-Host ""
Write-Host "连接后执行以下命令：" -ForegroundColor Yellow
Write-Host ""
Write-Host "# 1. 备份当前配置" -ForegroundColor Gray
Write-Host "sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.`$(date +%Y%m%d_%H%M%S)" -ForegroundColor White
Write-Host ""
Write-Host "# 2. 应用新配置" -ForegroundColor Gray
Write-Host "sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf" -ForegroundColor White
Write-Host ""
Write-Host "# 3. 测试配置" -ForegroundColor Gray
Write-Host "sudo nginx -t" -ForegroundColor White
Write-Host ""
Write-Host "# 4. 重启Nginx" -ForegroundColor Gray
Write-Host "sudo systemctl reload nginx" -ForegroundColor White
Write-Host ""
Write-Host "# 5. 验证GZIP" -ForegroundColor Gray
Write-Host "curl -H 'Accept-Encoding: gzip' -I http://110.40.129.184/static_data.json | grep -i content-encoding" -ForegroundColor White
Write-Host ""

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host "准备工作完成！请按照上述步骤手动执行" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
