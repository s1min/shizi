#!/bin/bash
# MongoDB 备份脚本
# 用法: ./scripts/backup-mongo.sh
# 建议通过 crontab 每日执行: 0 3 * * * /path/to/backup-mongo.sh

set -e

BACKUP_DIR="$(pwd)/backups/mongo"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

mkdir -p "$BACKUP_PATH"

echo "=== MongoDB 备份开始: $DATE ==="

# 通过 docker compose 执行 mongodump
docker compose exec -T mongo mongodump \
  --db shizi \
  --out /tmp/backup

# 从容器中复制出来
docker compose cp mongo:/tmp/backup/shizi "$BACKUP_PATH/"

# 清理容器内临时文件
docker compose exec -T mongo rm -rf /tmp/backup

# 压缩
cd "$BACKUP_DIR"
tar -czf "$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "=== 备份完成: $BACKUP_DIR/$DATE.tar.gz ==="
