# 趣字宝 MVP 后续开发计划

> ⚠️ 本文档已被主计划接管：请优先查看 [project_master_plan.md](project_master_plan.md)。

> 制定日期：2026-03-10
> 基准文档：product_prototype_v3.md（个人开发者落地版）
> 当前阶段：前端 UI 验收完成，进入后端加固与上线冲刺

---

## 一、当前项目状态

| 维度 | 状态 | 说明 |
|------|------|------|
| 前端 | ✅ 基本完成 | 7 个页面 + 4 个学习组件，Pinia 持久化 + 云端同步，自定义 3-tab tabbar，257 个汉字数据静态 JSON |
| 后端 | ⚠️ 待补全 | NestJS 11 + MongoDB，仅 Auth/User/Learning 3 个模块，缺 DTO 验证、characters/libraries API、review-list |
| 基础设施 | ❌ 未搭建 | 无 Docker、无部署配置、无 CI/CD |

本计划聚焦「从能跑到能上线」的差距，按依赖顺序分 5 个阶段推进。

---

## 二、第一阶段：后端加固与 API 补全（第 1-2 周，~19h）

> 前端基本完成，后端是上线主要瓶颈

### 1.1 全局 DTO 验证 [P0, 2h]

当前所有 Controller 的 `@Body()` 参数都是裸 `any` 类型，无效请求会导致 500 而非 400。

- 安装 `class-validator` + `class-transformer`
- `main.ts` 添加 `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
- 为现有 3 个模块创建 DTO

**涉及文件**：
- `shizi-backend/src/main.ts`
- 新建 `shizi-backend/src/modules/auth/dto/wx-login.dto.ts`
- 新建 `shizi-backend/src/modules/user/dto/update-user.dto.ts`
- 新建 `shizi-backend/src/modules/learning/dto/sync-progress.dto.ts`

### 1.2 CharacterModule — 汉字数据 API [P0, 4h]

v3 规格要求 `GET /characters/batch?ids=火,水,山`。当前汉字数据仅以静态 JSON 打包在前端，后端无此 API。

- 创建 Character schema（对齐前端 `types/character.ts` 的 `Character` 接口）
- 实现 `GET /api/characters/batch?ids=火,水,山`
- 创建数据导入脚本

**涉及文件**：
- 新建 `shizi-backend/src/modules/character/` 目录（schema/module/service/controller）
- 新建 `shizi-backend/scripts/seed-characters.ts`
- 修改 `shizi-backend/src/app.module.ts`

### 1.3 LibraryModule — 字库 API [P0, 3h]

v3 规格要求 `GET /libraries` 和 `GET /libraries/:id`。当前前端硬编码字库列表。

- 创建 Library schema
- 实现 `GET /api/libraries`（列表，不含 stages 详情）
- 实现 `GET /api/libraries/:id`（完整结构含 stages/units/chars）
- 创建数据导入脚本

**涉及文件**：
- 新建 `shizi-backend/src/modules/library/` 目录
- 新建 `shizi-backend/scripts/seed-libraries.ts`
- 修改 `shizi-backend/src/app.module.ts`

### 1.4 扩展 UserModule — 宝宝信息 [P1, 2h]

v3 规格要求 `PUT /user/child`。当前 User schema 只有 openid/nickname/avatar。

- User schema 添加 `child` 嵌套字段（name, age_group, current_library, daily_new_chars）
- 实现 `PUT /api/user/child`
- `GET /api/user/info` 返回值包含 child

**涉及文件**：
- 修改 `shizi-backend/src/modules/user/user.schema.ts`
- 修改 `shizi-backend/src/modules/user/user.controller.ts`
- 修改 `shizi-backend/src/modules/user/user.service.ts`

### 1.5 扩展 LearningModule — 复习列表 [P1, 2h]

v3 规格要求 `GET /learning/review-list`。

- LearningService 添加 `getReviewList(userId)`，筛选 `nextReviewAt <= now`
- LearningController 添加 `GET /api/learning/review-list`

**涉及文件**：
- 修改 `shizi-backend/src/modules/learning/learning.service.ts`
- 修改 `shizi-backend/src/modules/learning/learning.controller.ts`

### 1.6 后端单元测试 [P1, 4h]

- AuthService 单元测试（mock axios + UserService）
- LearningService 单元测试（mock Mongoose Model）
- CharacterService / LibraryService 基础测试
- 目标：核心 service 层覆盖率 > 80%

### 1.7 统一数据种子脚本 [P0, 2h]

- 合并 characters + libraries 导入为统一 seed 命令
- `package.json` 添加 `"seed": "ts-node scripts/seed.ts"`
- 支持 `--drop` 参数清空重建

**阶段验证**：
1. 全部 9 个 v3 API 端点可用且返回正确数据
2. 无效请求返回 400 而非 500
3. `npm test` 通过
4. `npm run seed` 可重复执行

---

## 三、第二阶段：部署基础设施（第 2-3 周，~8h）

### 2.1 后端 Dockerfile [P0, 2h]

- 多阶段构建（build + production），`node:20-alpine` 基础镜像
- 添加 `.dockerignore`

### 2.2 Docker Compose 编排 [P0, 3h]

对齐 v3 规格 §7.4 部署方案：app + mongo + nginx 三服务。

- 创建 `docker-compose.yml`
- Nginx 反向代理 `/api` → NestJS
- MongoDB 数据卷持久化
- `.env.production` 模板

### 2.3 SSL 证书 + 备份 [P1, 3h]

- docker-compose 添加 certbot 服务
- Nginx SSL 终止配置
- MongoDB 定时备份脚本（mongodump + cron）

**阶段验证**：
1. `docker compose up -d` 一键启动
2. `curl http://localhost/api/libraries` 返回数据
3. 重启容器后 MongoDB 数据不丢失

---

## 四、第三阶段：前端适配与补全（第 3-4 周，~15h）

### 3.1 图鉴页三态展示 [P1, 3h]

v3 §4.5 要求：已掌握（彩色）、学习中（白色+进度标记）、未学习（灰色+"?"）。

### 3.2 我的页菜单功能化 [P1, 3h]

- "汉字图鉴" → `uni.switchTab` 跳转图鉴 tab
- "学习日报" → 展示学习统计弹窗
- "勋章墙" → 提示"即将开放"

### 3.3 新用户引导流程 [P1, 4h]

v3 §4.1 要求 2 步引导：微信登录 → 选择字库 → 进入首页。

### 3.4 前端对接后端新 API [P1, 3h]

- 新建 `api/character.ts` 和 `api/library.ts`
- learn store 优先从 API 加载，失败时 fallback 到本地 JSON

### 3.5 小程序分包优化 [P1, 2h]

- 学习相关页面拆为子包
- 确保主包大小 < 2MB

**阶段验证**：
1. 图鉴页展示三种状态
2. 我的页菜单项全部可点击
3. 新用户引导流程完整
4. 前端可从 API 加载数据，断网时 fallback 正常
5. 主包大小 < 2MB

---

## 五、第四阶段：微信小程序上线准备（第 4-5 周，~15h）

### 4.1 真机测试与适配 [P0, 6h]

- 微信开发者工具完整测试
- 至少 3 台真机（iOS + Android）
- 重点：TracingPractice Canvas 2D 兼容性、TTS 语音播放

### 4.2 审核资质准备 [P0, 4h]

- 隐私政策页面 + 用户协议页面
- 微信隐私保护指引
- 小程序类目：个人开发者建议用"工具"类目
- 服务器域名白名单

### 4.3 服务器部署 [P0, 3h]

- 轻量云服务器（2C2G，约 50-100 元/月）
- Docker Compose 部署
- 域名 + SSL 证书
- 微信后台配置服务器域名

### 4.4 提交审核 [P0, 2h]

- 预留 3-7 天审核周期

---

## 六、第五阶段：上线后迭代（按需）

| 任务 | 优先级 | 工时 |
|------|--------|------|
| 请求日志中间件 + 健康检查 `GET /api/health` | P2 | 2h |
| 一年级下册字库数据制作 + 导入 | P2 | 4h |
| characters 批量查询缓存 | P2 | 2h |
| 前端图片懒加载 | P2 | 1h |
| 学习进度同步防抖 | P2 | 1h |

---

## 七、时间线总览

| 周次 | 阶段 | 核心产出 | 工时 |
|------|------|----------|------|
| 第 1 周 | 1.1-1.5 | 后端 API 补全 + DTO 验证 | ~13h |
| 第 2 周 | 1.6-1.7 + 2.1-2.2 | 后端测试 + Docker 部署 | ~11h |
| 第 3 周 | 2.3 + 3.1-3.3 | SSL + 前端适配 | ~13h |
| 第 4 周 | 3.4-3.5 + 4.1-4.2 | API 对接 + 真机测试 | ~15h |
| 第 5 周 | 4.3-4.4 | 部署上线 + 提交审核 | ~5h |

**总工时约 57 小时**，按每天 3 小时有效开发计算，约 19 个工作日，5 周内可完成。

---

## 八、风险缓解

| 风险 | 缓解措施 |
|------|----------|
| HanziWriter 真机 Canvas 兼容性 | TracingPractice 已有 H5/WX 双实现，最坏情况降级为笔顺动画展示 |
| 微信审核被拒（教育类目资质） | 个人开发者用"工具"类目提交；第 3 周开始准备材料 |
| 主包超 2MB | stroke_paths/stroke_medians 改为按需 API 加载 |
| 单人开发瓶颈 | 严格按阶段推进，不同时开多个战线 |
| MongoDB 数据安全 | Docker 内 MongoDB + 每日备份脚本；可选 Atlas 免费集群备份 |
