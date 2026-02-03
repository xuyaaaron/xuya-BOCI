# Nginx性能优化部署方案

## 服务器信息
- 地址: 110.40.129.184
- 用户: deploy
- 密码: AAbb123456789

## 部署步骤

### 方式一：使用SSH直接执行（推荐）

打开PowerShell或命令提示符，执行以下命令：

#### 1. 上传Nginx配置文件

```powershell
# 在本地项目目录执行
scp nginx.conf deploy@110.40.129.184:/tmp/

# 输入密码: AAbb123456789
```

#### 2. SSH连接到服务器

```powershell
ssh deploy@110.40.129.184

# 输入密码: AAbb123456789
```

#### 3. 在服务器上执行部署命令

连接成功后，依次执行：

```bash
# 备份当前配置
sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.$(date +%Y%m%d_%H%M%S)

# 应用新配置
sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf

# 测试配置（必须显示 "syntax is ok" 和 "test is successful"）
sudo nginx -t

# 如果测试通过，重启Nginx
sudo systemctl reload nginx

# 验证GZIP是否生效
curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json | grep -i content-encoding

# 应该看到: Content-Encoding: gzip
```

#### 4. 验证效果

在浏览器中访问：
- http://110.40.129.184/

打开开发者工具（F12）-> Network标签，刷新页面：
- 查看 `static_data.json` 的大小
- 应该显示约 2-3MB（压缩后）而不是25.88MB

### 方式二：使用自动化脚本

如果服务器可以访问GitHub：

```bash
# SSH连接到服务器
ssh deploy@110.40.129.184

# 下载并执行部署脚本
curl -o deploy.sh https://raw.githubusercontent.com/xuyaaaron/2X/main/deploy_nginx_optimization.sh
chmod +x deploy.sh
./deploy.sh
```

### 方式三：手动复制内容

如果SSH/SCP不方便，可以手动操作：

1. SSH连接到服务器：`ssh deploy@110.40.129.184`

2. 编辑配置文件：
```bash
sudo nano /etc/nginx/conf.d/my_site.conf
```

3. 删除所有内容，粘贴以下内容：

```nginx
server {
    listen 80;
    server_name 110.40.129.184;

    # 启用GZIP压缩 - 可以将26MB的JSON压缩到约2-3MB
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_min_length 1000;
    
    # 浏览器缓存控制
    location ~* \.(json)$ {
        root /home/deploy/web/myproject;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
        add_header X-Content-Type-Options "nosniff";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /home/deploy/web/myproject;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        root /home/deploy/web/myproject;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # HTML文件不缓存，确保每次都是最新版本
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

4. 保存并退出（Ctrl+O, Enter, Ctrl+X）

5. 测试和重启：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 验证部署成功

### 1. 检查Nginx状态
```bash
sudo systemctl status nginx
# 应该显示 "active (running)"
```

### 2. 检查GZIP压缩
```bash
curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json

# 查看响应头，应该包含：
# Content-Encoding: gzip
# Content-Type: application/json
```

### 3. 测试文件大小
```bash
# 不压缩的大小
curl -o /dev/null -s -w '%{size_download}\n' http://110.40.129.184/static_data.json

# 压缩后的大小
curl -H "Accept-Encoding: gzip" -o /dev/null -s -w '%{size_download}\n' http://110.40.129.184/static_data.json
```

压缩后应该只有约2-3MB（原始25.88MB）

### 4. 浏览器测试
1. 打开 http://110.40.129.184/
2. F12 打开开发者工具
3. Network 标签
4. 刷新页面
5. 查看 `static_data.json`:
   - Size列应该显示 ~2-3MB
   - 响应头应该有 `Content-Encoding: gzip`

## 故障排除

### 问题1: nginx -t 失败
```bash
# 查看详细错误
sudo nginx -t

# 检查配置文件语法
sudo cat /etc/nginx/conf.d/my_site.conf

# 如果有问题，恢复备份
sudo cp /etc/nginx/conf.d/my_site.conf.backup.* /etc/nginx/conf.d/my_site.conf
```

### 问题2: Nginx启动失败
```bash
# 查看错误日志
sudo tail -50 /var/log/nginx/error.log

# 检查端口占用
sudo netstat -tlnp | grep :80

# 重启Nginx服务
sudo systemctl restart nginx
```

### 问题3: GZIP未生效
```bash
# 检查gzip模块是否加载
nginx -V 2>&1 | grep -o with-http_gzip

# 检查配置是否正确应用
sudo nginx -T | grep gzip

# 清除浏览器缓存后重试
```

### 问题4: 文件404
```bash
# 检查文件路径
ls -la /home/deploy/web/myproject/static_data.json

# 检查权限
sudo chmod 644 /home/deploy/web/myproject/static_data.json
```

## 回滚方法

如果出现问题，快速回滚：

```bash
# 查看备份文件
ls -lt /etc/nginx/conf.d/my_site.conf.backup*

# 恢复最新备份
sudo cp /etc/nginx/conf.d/my_site.conf.backup.XXXXXX /etc/nginx/conf.d/my_site.conf

# 重启Nginx
sudo systemctl reload nginx
```

## 预期效果

部署成功后：
- ✅ JSON文件从25.88MB压缩到2-3MB
- ✅ 首次加载时间从1-3分钟降到5-15秒
- ✅ 浏览器缓存生效，刷新页面<500ms
- ✅ 切换标签<100ms（内存缓存）

## 监控命令

部署后可以用这些命令监控：

```bash
# 查看Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查Nginx配置
sudo nginx -T

# 重新加载配置（不中断服务）
sudo systemctl reload nginx
```
