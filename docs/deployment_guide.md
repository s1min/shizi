# è¶£å­—å®éƒ¨ç½²æŒ‡å—

## æœåŠ¡å™¨è¦æ±‚

- è½»é‡äº‘æœåŠ¡å™¨ 2C2Gï¼ˆè…¾è®¯äº‘/é˜¿é‡Œäº‘ï¼Œçº¦ 50-100 å…ƒ/æœˆï¼‰
- Ubuntu 22.04 æˆ– Debian 12
- å·²å¤‡æ¡ˆåŸŸåï¼ˆå¾®ä¿¡å°ç¨‹åºè¦æ±‚ HTTPS + å·²å¤‡æ¡ˆåŸŸåï¼‰

## ä¸€ã€æœåŠ¡å™¨åˆå§‹åŒ–

```bash
# æ›´æ–°ç³»ç»Ÿ
sudo apt update && sudo apt upgrade -y

# å®‰è£… Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# å®‰è£… Docker Composeï¼ˆDocker 20.10+ å·²å†…ç½®ï¼‰
docker compose version

# å®‰è£… Git
sudo apt install -y git
```

é‡æ–°ç™»å½•ä½¿ docker ç»„ç”Ÿæ•ˆã€‚

## äºŒã€éƒ¨ç½²åŽç«¯

```bash
# å…‹éš†é¡¹ç›®
git clone <your-repo-url> /opt/shizi
cd /opt/shizi

# åˆ›å»ºç”Ÿäº§çŽ¯å¢ƒé…ç½®
cp .env.production.example .env

# ç¼–è¾‘ .envï¼Œå¡«å…¥å®žé™…å€¼
# JWT_SECRET: ç”¨ openssl rand -hex 32 ç”Ÿæˆ
# WX_APPID / WX_APP_SECRET: å¾®ä¿¡å…¬ä¼—å¹³å°èŽ·å–
nano .env

# è¯´æ˜Žï¼šdocker-compose å·²å°† JWT_SECRET / WX_APPID / WX_APP_SECRET è®¾ä¸ºå¿…å¡«ã€‚
# è‹¥æœªé…ç½®ï¼Œdocker compose up ä¼šç›´æŽ¥æŠ¥é”™å¹¶åœæ­¢å¯åŠ¨ï¼ˆé¿å…ç©ºå¯†é’¥è¯¯ä¸Šçº¿ï¼‰ã€‚

# æŽ¨èï¼šå…ˆæ‰§è¡Œç”Ÿäº§çŽ¯å¢ƒå¼ºæ ¡éªŒï¼ˆé²æ­¢ placeholder å€¼ä¸Šçº¿ï¼‰
# Linux/macOS:
./scripts/verify-prod-env.sh .env
# Windows PowerShell:
.\scripts\verify-prod-env.ps1 -EnvFile .env

# å¯åŠ¨æœåŠ¡
docker compose up -d

# æŸ¥çœ‹æ—¥å¿—
docker compose logs -f app

# éªŒè¯å¥åº·æ£€æŸ¥
curl http://localhost/api/health
# åº”è¿”å›ž {"status":"ok","timestamp":"..."}
```

## ä¸‰ã€å¯¼å…¥æ•°æ®

```bash
# è¿›å…¥åŽç«¯å®¹å™¨æ‰§è¡Œ seedï¼ˆä½¿ç”¨ç¼–è¯‘äº§ç‰©ï¼‰
docker compose exec app node dist/scripts/seed.js

# å¦‚éœ€æ¸…ç©ºé‡å»º
docker compose exec app node dist/scripts/seed.js --drop

# éªŒè¯æ•°æ®
curl http://localhost/api/libraries
```

## 3.1 One-command deployment verification (recommended)

Use the script below to run the full local deployment loop:
compose config -> build -> up -> health -> seed -> libraries.

Before this step, run production env validation:

Linux/macOS:

```bash
./scripts/verify-prod-env.sh .env
```

Windows PowerShell:

```powershell
.\scripts\verify-prod-env.ps1 -EnvFile .env
```

Linux/macOS:

```bash
chmod +x scripts/verify-deploy.sh
./scripts/verify-deploy.sh
```

Windows PowerShell:

```powershell
.\scripts\verify-deploy.ps1
```

Optional (skip rebuild if image already exists):

```powershell
.\scripts\verify-deploy.ps1 -SkipBuild
```

## å››ã€é…ç½®åŸŸå + SSL

### 4.1 DNS è§£æž

åœ¨åŸŸåæœåŠ¡å•†å¤„æ·»åŠ  A è®°å½•ï¼ŒæŒ‡å‘æœåŠ¡å™¨ IPã€‚

### 4.2 ç”³è¯· SSL è¯ä¹¦

```bash
# ç¼–è¾‘ nginx é…ç½®ï¼Œå°† your-domain.com æ›¿æ¢ä¸ºå®žé™…åŸŸå
nano nginx/conf.d/default.conf

# è¿è¡Œ Let's Encrypt åˆå§‹åŒ–è„šæœ¬
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh your-domain.com admin@your-domain.com

# é‡å¯ nginx
docker compose restart nginx
```

### 4.3 å¯ç”¨ SSL é…ç½®

ç¼–è¾‘ `nginx/conf.d/default.conf`ï¼Œå–æ¶ˆ SSL server block çš„æ³¨é‡Šï¼Œæ›¿æ¢ `your-domain.com` ä¸ºå®žé™…åŸŸåã€‚

æ·»åŠ  HTTP â†’ HTTPS é‡å®šå‘ï¼š
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

```bash
docker compose restart nginx
```

### 4.4 è¯ä¹¦ç»­æœŸï¼ˆå»ºè®®ï¼‰

```bash
# æ¯æœˆ 1 å·å‡Œæ™¨ 3 ç‚¹å°è¯•ç»­æœŸå¹¶é‡å¯ nginx
crontab -e
# æ·»åŠ ï¼š
# 0 3 1 * * cd /opt/shizi && docker run --rm \
#   -v /opt/shizi/certbot/conf:/etc/letsencrypt \
#   -v /opt/shizi/certbot/www:/var/www/certbot \
#   certbot/certbot renew --webroot -w /var/www/certbot --quiet && \
#   docker compose restart nginx
```

## äº”ã€å¾®ä¿¡åŽå°é…ç½®

1. ç™»å½• [å¾®ä¿¡å…¬ä¼—å¹³å°](https://mp.weixin.qq.com)
2. å¼€å‘ç®¡ç† â†’ å¼€å‘è®¾ç½® â†’ æœåŠ¡å™¨åŸŸå
3. æ·»åŠ ä»¥ä¸‹åŸŸåï¼š
   - request åˆæ³•åŸŸåï¼š`https://your-domain.com`
4. ç¡®è®¤åŸŸåå·²å¤‡æ¡ˆ

## å…­ã€æž„å»ºå¹¶ä¸Šä¼ å°ç¨‹åº

```bash
# æœ¬åœ°æž„å»ºå¾®ä¿¡å°ç¨‹åº
cd shizi-frontend
pnpm build:mp-weixin

# è¾“å‡ºç›®å½•ï¼šdist/build/mp-weixin
```

ç”¨å¾®ä¿¡å¼€å‘è€…å·¥å…·æ‰“å¼€ `dist/build/mp-weixin` ç›®å½•ï¼Œç‚¹å‡»ã€Œä¸Šä¼ ã€ã€‚

## ä¸ƒã€æ•°æ®å¤‡ä»½

```bash
# æ‰‹åŠ¨å¤‡ä»½
chmod +x scripts/backup-mongo.sh
./scripts/backup-mongo.sh

# è®¾ç½®å®šæ—¶å¤‡ä»½ï¼ˆæ¯å¤©å‡Œæ™¨ 3 ç‚¹ï¼‰
crontab -e
# æ·»åŠ ï¼š
# 0 3 * * * /opt/shizi/scripts/backup-mongo.sh >> /var/log/shizi-backup.log 2>&1
```

## å…«ã€å¸¸ç”¨è¿ç»´å‘½ä»¤

```bash
# æŸ¥çœ‹æœåŠ¡çŠ¶æ€
docker compose ps

# æŸ¥çœ‹åŽç«¯æ—¥å¿—
docker compose logs -f app

# é‡å¯æœåŠ¡
docker compose restart

# æ›´æ–°éƒ¨ç½²
git pull
docker compose up -d --build

# è¿›å…¥ MongoDB shell
docker compose exec mongo mongosh shizi
```

## ä¹ã€æäº¤å®¡æ ¸æ¸…å•

- [ ] æœåŠ¡å™¨éƒ¨ç½²å®Œæˆï¼ŒHTTPS API å¯è®¿é—®
- [ ] `curl https://your-domain.com/api/health` è¿”å›ž ok
- [ ] `curl https://your-domain.com/api/libraries` è¿”å›žå­—åº“æ•°æ®
- [ ] å¾®ä¿¡åŽå°å·²é…ç½®æœåŠ¡å™¨åŸŸå
- [ ] éšç§æ”¿ç­–é¡µé¢å¯è®¿é—®ï¼ˆå°ç¨‹åºå†… /pages/privacy/indexï¼‰
- [ ] ç”¨æˆ·åè®®é¡µé¢å¯è®¿é—®ï¼ˆå°ç¨‹åºå†… /pages/agreement/indexï¼‰
- [ ] çœŸæœºæµ‹è¯•é€šè¿‡ï¼ˆiOS + Android å„è‡³å°‘ 1 å°ï¼‰
- [ ] å°ç¨‹åºç±»ç›®é€‰æ‹©ã€Œå·¥å…·ã€ï¼ˆé¿å…æ•™è‚²ç±»ç›®çš„é¢å¤–èµ„è´¨ï¼‰
- [ ] ä¸Šä¼ ä»£ç å¹¶æäº¤å®¡æ ¸ï¼ˆé¢„ç•™ 3-7 å¤©å®¡æ ¸å‘¨æœŸï¼‰
