@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo.
echo ======================================================================
echo 🚀 Nginx性能优化 - 自动部署助手
echo ======================================================================
echo.
echo 服务器: 110.40.129.184
echo 用户名: deploy  
echo 密码: AAbb123456789
echo.
echo ======================================================================
echo 📋 部署步骤
echo ======================================================================
echo.

echo [步骤 1/4] 上传nginx.conf配置文件
echo.
echo 请复制以下命令到PowerShell执行:
echo.
echo scp nginx.conf deploy@110.40.129.184:/tmp/
echo.
echo 提示输入密码时输入: AAbb123456789
echo.
pause
echo.

echo [步骤 2/4] 上传部署脚本
echo.
echo scp server_deploy.sh deploy@110.40.129.184:/tmp/
echo.
pause
echo.

echo [步骤 3/4] SSH连接到服务器
echo.
echo 请复制以下命令到PowerShell执行:
echo.
echo ssh deploy@110.40.129.184
echo.
echo 提示输入密码时输入: AAbb123456789
echo.
pause
echo.

echo [步骤 4/4] 在服务器上执行部署
echo.
echo 连接成功后，复制以下命令执行:
echo.
echo chmod +x /tmp/server_deploy.sh ^&^& /tmp/server_deploy.sh
echo.
echo 或者使用一键命令:
echo.
echo sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.$(date +%%Y%%m%%d_%%H%%M%%S) ^&^& sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf ^&^& sudo nginx -t ^&^& sudo systemctl reload nginx ^&^& curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json ^| grep -i content-encoding
echo.
echo ======================================================================
echo 📚 详细文档: QUICK_DEPLOY.md
echo ======================================================================
echo.
pause
