# NestJS 在微信云开发中的最佳实践

**结论：支持，且强烈推荐使用“微信云托管”模式。**

如果您希望使用 **NestJS** 这种企业级框架来开发后端，微信云开发生态完全支持，但需要选择正确的部署模式。

---

## 1. 部署模式选择：云托管 vs 云函数

| 维度 | **微信云托管 (Cloud Hosting)** | 微信云函数 (Cloud Functions) |
| :--- | :--- | :--- |
| **底层技术** | **Docker 容器** (基于 K8s) | Serverless FaaS (函数即服务) |
| **NestJS 适配度** | ⭐⭐⭐⭐⭐ (**完美**) | ⭐⭐ (勉强) |
| **代码修改** | **无需修改** (标准 NestJS 项目) | 需加适配层 (Adapter) |
| **冷启动** | 支持实例常驻，无冷启动问题 | 有冷启动延迟 (NestJS 启动较慢) |
| **成本** | 按容器规格计费 (有免费额度) | 按调用次数计费 |
| **适用场景** | 单体应用、复杂框架、长连接 | 轻量级脚本、简单 API |

### 为什么不推荐在“云函数”里跑 NestJS？
虽然可以使用 `serverless-http` 等库将 NestJS 包装成云函数，但 NestJS 框架本身初始化较重（依赖注入容器扫描等），会导致**冷启动时间较长**（可能达 1-3 秒）。这意味着用户每次请求可能都要等几秒，体验极差。

### 为什么推荐“云托管”？
微信云托管直接支持 **Docker**。您可以把 NestJS 打包成镜像部署，这与在公司服务器或阿里云 ECS 上部署完全一样。
*   **0 改造**：标准的 `npm run start:prod` 即可运行。
*   **内网互通**：小程序前端可以通过 `wx.cloud.callContainer` 免鉴权调用 NestJS 接口（无需处理微信登录态，请求头自带 `x-wx-openid`）。

---

## 2. 实战：如何部署 NestJS 到微信云托管

### 第一步：准备 Dockerfile
在您的 NestJS 项目根目录下创建一个 `Dockerfile`：

```dockerfile
# 1. Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 推荐使用淘宝源加速
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
COPY . .
RUN npm run build

# 2. Production Stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# 微信云托管通常暴露 80 端口
EXPOSE 80
ENV PORT=80

CMD ["node", "dist/main"]
```

### 第二步：修改监听端口 (main.ts)
确保您的 NestJS 应用监听 `process.env.PORT` 或默认 80 端口。

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 微信云托管会注入 PORT 环境变量，通常是 80
  const port = process.env.PORT || 80; 
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

### 第三步：推送到微信云托管
1.  登录 [微信云托管控制台](https://cloud.weixin.qq.com/cloudrun)。
2.  新建服务 -> 绑定 GitHub/GitLab 或直接上传代码包。
3.  系统会自动识别 `Dockerfile` 并开始构建部署。

---

## 3. 关键优势：免鉴权调用 (CallContainer)

这是使用 NestJS + 微信云托管的**最大杀手锏**。

**传统模式**：
小程序 `wx.request` -> 后端 -> 后端拿 code 找微信服务器换 openid -> 生成 JWT -> 返回前端。

**云托管模式**：
小程序 `wx.cloud.callContainer` -> 微信私有链路 -> NestJS 容器。

**NestJS 获取用户身份**：
请求到达 NestJS 时，HTTP Header 中会自动带上：
*   `x-wx-openid`: 用户的 OpenID
*   `x-wx-unionid`: 用户的 UnionID (如果有)
*   `x-wx-source`: 来源 (小程序/公众号)

您只需要写一个简单的 **Guard (守卫)** 或 **Middleware** 即可直接获取用户身份，**完全省去了微信登录流程**！

```typescript
// 示例：WechatAuthGuard
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class WechatAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const openid = request.headers['x-wx-openid'];
    
    if (!openid) return false; // 非微信环境拒绝访问
    
    // 将 openid 注入到 request 对象中，方便 Controller 使用
    request.user = { openid };
    return true;
  }
}
```

## 4. 总结
*   **可以用 NestJS 吗？** -> **完全可以**。
*   **怎么用？** -> 请开通 **微信云托管** (Cloud Hosting)，不要用云函数。
*   **好处？** -> 0 运维、0 改造、免鉴权、自带 HTTPS。
