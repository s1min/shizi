# 趣字宝部署指南

## 服务器要求

- 轻量云服务器 2C2G（腾讯云/阿里云，约 50-100 元/月）
- Ubuntu 22.04 或 Debian 12
- 已备案域名（微信小程序要求 HTTPS + 已备案域名）

## 一、服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose（Docker 20.10+ 已内置）
docker compose version

# 安装 Git
sudo apt install -y git
```

重新登录使 docker 组生效。

## 二、部署后端

```bash
# 克隆项目
git clone <your-repo-url> /opt/shizi
cd /opt/shizi

# 创建生产环境配置
cp .env.production.example .env

# 编辑 .env，填入实际值
# JWT_SECRET: 用 openssl rand -hex 32 生成
# WX_APPID / WX_APP_SECRET: 微信公众平台获取
nano .env

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f app

# 验证健康检查
curl http://localhost/api/health
# 应返回 {"status":"ok","timestamp":"..."}
```

## 三、导入数据

```bash
# 进入后端容器执行 seed
docker compose exec app node scripts/seed.js
# 或者如果 seed 脚本是 TypeScript：
docker compose exec app npx ts-node scripts/seed.ts

# 验证数据
curl http://localhost/api/libraries
```

## 四、配置域名 + SSL

### 4.1 DNS 解析

在域名服务商处添加 A 记录，指向服务器 IP。

### 4.2 申请 SSL 证书

```bash
# 编辑 nginx 配置，将 your-domain.com 替换为实际域名
nano nginx/conf.d/default.conf

# 运行 Let's Encrypt 初始化脚本
chmod +x scripts/init-letsencrypt.sh
# 编辑脚本中的域名和邮箱
nano scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh

# 重启 nginx
docker compose restart nginx
```

### 4.3 启用 SSL 配置

编辑 `nginx/conf.d/default.conf`，取消 SSL server block 的注释，替换 `your-domain.com` 为实际域名。

添加 HTTP → HTTPS 重定向：
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

## 五、微信后台配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 开发管理 → 开发设置 → 服务器域名
3. 添加以下域名：
   - request 合法域名：`https://your-domain.com`
4. 确认域名已备案

## 六、构建并上传小程序

```bash
# 本地构建微信小程序
cd shizi-frontend
pnpm build:mp-weixin

# 输出目录：dist/build/mp-weixin
```

用微信开发者工具打开 `dist/build/mp-weixin` 目录，点击「上传」。

## 七、数据备份

```bash
# 手动备份
chmod +x scripts/backup-mongo.sh
./scripts/backup-mongo.sh

# 设置定时备份（每天凌晨 3 点）
crontab -e
# 添加：
# 0 3 * * * /opt/shizi/scripts/backup-mongo.sh >> /var/log/shizi-backup.log 2>&1
```

## 八、常用运维命令

```bash
# 查看服务状态
docker compose ps

# 查看后端日志
docker compose logs -f app

# 重启服务
docker compose restart

# 更新部署
git pull
docker compose up -d --build

# 进入 MongoDB shell
docker compose exec mongo mongosh shizi
```

## 九、提交审核清单

- [ ] 服务器部署完成，HTTPS API 可访问
- [ ] `curl https://your-domain.com/api/health` 返回 ok
- [ ] `curl https://your-domain.com/api/libraries` 返回字库数据
- [ ] 微信后台已配置服务器域名
- [ ] 隐私政策页面可访问（小程序内 /pages/privacy/index）
- [ ] 用户协议页面可访问（小程序内 /pages/agreement/index）
- [ ] 真机测试通过（iOS + Android 各至少 1 台）
- [ ] 小程序类目选择「工具」（避免教育类目的额外资质）
- [ ] 上传代码并提交审核（预留 3-7 天审核周期）
