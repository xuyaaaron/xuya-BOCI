#!/bin/bash
# 性能优化部署脚本 - 更新Nginx配置启用GZIP压缩

echo "=================================="
echo "🚀 性能优化部署脚本"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在服务器上运行
if [ ! -f "/etc/nginx/nginx.conf" ]; then
    echo -e "${RED}错误：未检测到Nginx，此脚本需要在服务器上运行${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 1/4: 备份当前Nginx配置${NC}"
sudo cp /etc/nginx/conf.d/my_site.conf /etc/nginx/conf.d/my_site.conf.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✓ 配置已备份${NC}"
echo ""

echo -e "${YELLOW}步骤 2/4: 下载新的Nginx配置${NC}"
# 从GitHub下载最新的nginx.conf
curl -o /tmp/nginx.conf https://raw.githubusercontent.com/xuyaaaron/2X/main/nginx.conf
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 下载失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 配置文件已下载${NC}"
echo ""

echo -e "${YELLOW}步骤 3/4: 应用新配置${NC}"
sudo cp /tmp/nginx.conf /etc/nginx/conf.d/my_site.conf
echo -e "${GREEN}✓ 新配置已应用${NC}"
echo ""

echo -e "${YELLOW}步骤 4/4: 测试并重启Nginx${NC}"
# 测试配置
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Nginx配置测试失败，正在回滚...${NC}"
    sudo cp /etc/nginx/conf.d/my_site.conf.backup.* /etc/nginx/conf.d/my_site.conf 2>/dev/null
    exit 1
fi

# 重启Nginx
sudo systemctl reload nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Nginx重启失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Nginx已重启${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}✓ 部署完成！${NC}"
echo "=================================="
echo ""
echo "验证GZIP是否生效："
echo "curl -H \"Accept-Encoding: gzip\" -I http://110.40.129.184/static_data.json | grep -i content-encoding"
echo ""
echo "预期看到：Content-Encoding: gzip"
echo ""

# 自动验证
echo "正在验证..."
GZIP_CHECK=$(curl -H "Accept-Encoding: gzip" -I http://110.40.129.184/static_data.json 2>/dev/null | grep -i "content-encoding: gzip")
if [ ! -z "$GZIP_CHECK" ]; then
    echo -e "${GREEN}✓ GZIP压缩已成功启用！${NC}"
else
    echo -e "${YELLOW}⚠ 未检测到GZIP，可能需要等待几秒钟...${NC}"
fi
