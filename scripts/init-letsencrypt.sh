#!/bin/bash
# SSL 证书初始化脚本（Let's Encrypt + Certbot）
# 用法: ./scripts/init-letsencrypt.sh your-domain.com your@email.com

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "用法: $0 <域名> <邮箱>"
  echo "示例: $0 api.quzibao.com admin@quzibao.com"
  exit 1
fi

echo "=== 为 $DOMAIN 申请 SSL 证书 ==="

# 创建目录
mkdir -p certbot/conf certbot/www

# 先用 HTTP 模式启动 nginx
docker compose up -d nginx

# 申请证书
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "=== 证书申请完成 ==="
echo "请编辑 nginx/conf.d/default.conf 取消 SSL server 块的注释，"
echo "并将 your-domain.com 替换为 $DOMAIN"
echo "然后运行: docker compose restart nginx"
