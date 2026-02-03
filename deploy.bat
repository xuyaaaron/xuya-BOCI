@echo off
chcp 65001 > nul
echo ======================================================================
echo 🚀 Nginx性能优化部署脚本
echo ======================================================================
echo.

echo 步骤 1/5: 上传nginx.conf到服务器...
echo.
echo 执行命令: scp nginx.conf deploy@110.40.129.184:/tmp/
echo 密码: AAbb123456789
echo.

scp nginx.conf deploy@110.40.129.184:/tmp/

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 文件上传失败！请检查网络连接
    pause
    exit /b 1
)

echo.
echo ✅ 文件上传成功！
echo.
echo ======================================================================
echo 步骤 2-5: 现在需要SSH连接服务器执行部署命令
echo ======================================================================
echo.
echo 请执行以下命令连接服务器：
echo.
echo ssh deploy@110.40.129.184
echo.
echo 密码: AAbb123456789
echo.
echo 连接后，依次执行以下命令：
echo.
echo # 1. 备份配置
echo sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.$(date +%%Y%%m%%d_%%H%%M%%S)
echo.
echo # 2. 应用新配置
echo sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf
echo.
echo # 3. 测试配置
echo sudo nginx -t
echo.
echo # 4. 重启Nginx
echo sudo systemctl reload nginx
echo.
echo # 5. 验证GZIP
echo curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json ^| grep -i content-encoding
echo.
echo ======================================================================
echo 详细说明请查看: NGINX_DEPLOY_GUIDE.md
echo ======================================================================
echo.
pause
