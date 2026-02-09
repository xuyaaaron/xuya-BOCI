$password = "AAbb123456789"
$server = "110.40.129.184"
$user = "deploy"

# 创建包含密码的临时文件
$password | Out-File -FilePath "temp_pwd.txt" -Encoding ASCII -NoNewline

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🚀 开始自动部署Nginx优化配置" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 上传nginx.conf
Write-Host "📤 步骤 1/3: 上传nginx.conf..." -ForegroundColor Yellow
Write-Host "命令: scp nginx.conf ${user}@${server}:/tmp/" -ForegroundColor Gray

# 使用type命令通过管道传递密码（适用于某些SSH客户端）
$uploadCmd = "scp -o StrictHostKeyChecking=no nginx.conf ${user}@${server}:/tmp/"

Write-Host "执行: $uploadCmd" -ForegroundColor Gray
Write-Host "提示: 如果提示输入密码，请输入: $password" -ForegroundColor Yellow
Write-Host ""

# 步骤2: 上传部署脚本
Write-Host "📤 步骤 2/3: 上传部署脚本..." -ForegroundColor Yellow
$uploadScript = "scp -o StrictHostKeyChecking=no server_deploy.sh ${user}@${server}:/tmp/"
Write-Host "执行: $uploadScript" -ForegroundColor Gray
Write-Host ""

# 步骤3: 连接并执行
Write-Host "🔌 步骤 3/3: SSH连接并执行部署..." -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "⚠️  需要手动输入密码完成部署" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "密码: $password" -ForegroundColor Green
Write-Host ""
Write-Host "请依次执行以下命令：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 上传配置文件:" -ForegroundColor Yellow
Write-Host "   scp nginx.conf ${user}@${server}:/tmp/" -ForegroundColor White
Write-Host ""
Write-Host "2. 上传部署脚本:" -ForegroundColor Yellow
Write-Host "   scp server_deploy.sh ${user}@${server}:/tmp/" -ForegroundColor White
Write-Host ""
Write-Host "3. SSH连接:" -ForegroundColor Yellow
Write-Host "   ssh ${user}@${server}" -ForegroundColor White
Write-Host ""
Write-Host "4. 在服务器上执行:" -ForegroundColor Yellow
Write-Host "   chmod +x /tmp/server_deploy.sh" -ForegroundColor White
Write-Host "   /tmp/server_deploy.sh" -ForegroundColor White
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "或者使用一键部署命令 (在服务器上直接执行):" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.`$(date +%Y%m%d_%H%M%S) && sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf && sudo nginx -t && sudo systemctl reload nginx && echo '✓ 部署完成！' && curl -H 'Accept-Encoding: gzip' -I http://110.40.129.184/static_data.json | grep -i content-encoding" -ForegroundColor White
Write-Host ""

# 清理临时文件
Remove-Item "temp_pwd.txt" -ErrorAction SilentlyContinue
