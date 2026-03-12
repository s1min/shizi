# 趣字宝 MVP 开发计划

> 制定日期：2026-03-04
> 当前阶段：MVP 冲刺前期
> 目标：完成可上线的微信小程序 MVP

---

## 一、项目目标

**MVP 定义**：用户能完整体验「学习一个单元（6个汉字）」的全流程，包括字源动画、跟读练习、描红练习、测验闯关、结算打卡，并能通过微信登录保存学习进度。

**上线标准**：
- 核心学习流程无阻塞性 Bug
- 微信小程序审核通过
- 支持 10 个以上真实用户同时使用

---

## 二、阶段规划

### 阶段 0：项目基建（立即执行）

**目标**：建立安全的开发环境，确保代码不丢失

| # | 任务 | 说明 |
|---|------|------|
| 0.1 | 初始化 Git 仓库 | 配置 `.gitignore`，做首次提交 |
| 0.2 | 验证前端可运行 | H5 模式 `pnpm dev`，记录现有报错 |
| 0.3 | 配置环境变量 | 确认 `VITE_WX_APPID` 等配置正确 |

---

### 阶段 1：单字学习闭环（第 1-2 周）

**目标**：让「火」这一个字的学习流程从头到尾跑通

#### 1.1 TTS 语音播放修复（P0，约 2h）

- 检查微信公众平台插件配置
- 确认 `wx.createInnerAudioContext` 调用方式
- 添加降级方案（静默模式）
- 验证字源页、跟读页语音正常播放

#### 1.2 描红 Canvas 小程序适配（P1，约 4h）

- 调研 HanziWriter 在 uni-app 小程序端的 Canvas 2D API 适配方案
- 实现 `TracingPractice.vue` 小程序端条件编译
- 验证笔顺动画和描红交互在真机上可用

#### 1.3 测验逻辑完善（P1，约 3h）

- 完善 `QuizCard.vue` 4 种题型的判定逻辑
- 实现计分、错题记录
- 添加答题反馈动画（正确/错误提示）

#### 1.4 学习进度本地持久化（P1，约 2h）

- 使用 `uni.setStorageSync` 持久化 Pinia learn store
- 记录：已学字、单元完成状态、连续打卡天数
- 首页进度条接入真实数据

#### 1.5 语音识别 ASR 接入（P1，约 4h，依赖 1.1）

- 接入微信同声传译插件
- 实现 `SpeakPractice.vue` 录音 → 识别 → 比对流程
- 添加识别失败的降级处理（跳过/重试）

#### 1.6 单元测试页面（P1，约 4h，依赖 1.3）

- 完善 `unit-test.vue` 综合闯关流程
- 实现题目随机抽取（从本单元已学字中出题）
- 通过/失败判定逻辑

#### 1.7 结算打卡页面（P2，约 3h，依赖 1.6）

- 完善 `unit-complete.vue` 结算展示
- 显示本次学习统计（用时、正确率、获得星星）
- 打卡海报生成（Canvas 绘制，可分享）

**阶段 1 交付物**：可完整体验的学习 Demo（1个单元 6 个字的完整闭环）

---

### 阶段 2：用户体系（第 3 周）

**目标**：支持微信登录，云端保存学习进度

**现状评估**：
- 前端 auth 基础设施已就绪：`useTokenStore`（单/双 token 模式、刷新、过期判断）、`useUserStore`（用户信息）、`api/login.ts`（登录/注册/微信登录 API 封装）均已实现
- 后端为空白 NestJS 11 脚手架，无任何业务模块、数据库、鉴权
- 「我的」页面使用硬编码数据，未接入 user store
- 无登录页面（`toLoginPage.ts` 指向 `/pages/login/index`，但页面不存在）

---

#### 2.1 后端基础搭建（P0，约 2h）

**目标**：配置数据库、环境变量、基础中间件

- 安装依赖：`@nestjs/config`、`@nestjs/mongoose`、`mongoose`
- 创建 `.env` / `.env.example`，配置项：
  - `MONGODB_URI`（MongoDB 连接串，开发阶段可用本地或 MongoDB Atlas 免费集群）
  - `JWT_SECRET`、`JWT_EXPIRES_IN`
  - `WX_APPID`、`WX_APP_SECRET`
  - `PORT`（默认 8000，云托管改 80）
- `AppModule` 注册 `ConfigModule.forRoot()` 和 `MongooseModule.forRootAsync()`
- 添加全局异常过滤器（统一错误响应格式）
- 添加全局响应拦截器（统一 `{ code, data, message }` 格式）
- 验证：启动后端，连接数据库成功

#### 2.2 微信登录 + JWT 鉴权（P0，约 4h）

**目标**：实现 `wx.login` code → openid → JWT 的完整链路

**后端**：
- 创建 `auth` 模块（`AuthModule`、`AuthController`、`AuthService`）
- 创建 `user` 模块（`UserModule`、`UserService`、`User` Schema）
- `User` Schema 字段：`openid`（唯一索引）、`nickname`、`avatar`、`createdAt`
- `POST /auth/wxLogin`：接收 `{ code }`，调用微信 `jscode2session` 获取 `openid` + `session_key`，查找或创建用户，签发 JWT
- `POST /auth/logout`：前端清 token 即可，后端可选记录
- `GET /user/info`：返回当前用户信息（从 JWT 解析 userId）
- 实现 `JwtAuthGuard`（`@nestjs/jwt` + `@nestjs/passport`），用于需要鉴权的接口
- 安装依赖：`@nestjs/jwt`、`@nestjs/passport`、`passport`、`passport-jwt`、`axios`（调微信 API）

**前端**：
- 创建登录页 `pages/login/index.vue`
  - 微信环境：一键授权登录按钮，调用 `tokenStore.wxLogin()`
  - H5 环境：显示「体验模式」提示，跳过登录直接使用本地数据
- 在 `pages.json` 注册登录页
- 配置 HTTP 拦截器：请求头带 `Authorization: Bearer <token>`，401 时跳转登录页
- 验证：小程序端点击登录 → 获取 code → 后端换 token → 前端存储 → 跳转首页

#### 2.3 个人中心页面接入（P1，约 3h）

**目标**：「我的」页面展示真实用户数据，支持登录/退出，形成登录闭环验证

- 改造 `pages/me/index.vue`：
  - 未登录态：显示「点击登录」卡片，点击跳转登录页
  - 已登录态：显示微信头像、昵称（从 `useUserStore` 读取）
  - 学习统计接入 `useLearnStore` 真实数据（已部分完成）
- 添加功能入口：
  - 「学习报告」：展示本周/本月学习统计（已学字数、学习天数、正确率趋势）
  - 「退出登录」：调用 `tokenStore.logout()`，清除本地数据，跳转首页
- 微信头像昵称获取：
  - 使用 `wx.getUserProfile`（已废弃）→ 改用 `<button open-type="chooseAvatar">` + `<input type="nickname">` 新方案
  - 首次登录后引导用户设置头像和昵称，存入后端 User 表
- 验证：登录 → 我的页面显示真实信息 → 退出 → 显示未登录态

#### 2.4 学习记录云端 API（P1，约 4h）

**目标**：后端提供学习进度的增删改查接口

**后端**：
- 创建 `learning` 模块
- `LearningRecord` Schema：
  - `userId`（关联 User）
  - `charRecords`：`{ charId, learnedAt, quizCorrect, reviewCount, nextReviewAt }`
  - `unitProgressMap`：`{ unitId: { charIndex, completed, stars } }`
  - `wrongRecords`：`[{ charId, quizType, unitId, wrongAt, retried }]`
  - `learnDays`：`string[]`
  - `updatedAt`：最后同步时间
- API 接口（均需 `@UseGuards(JwtAuthGuard)`）：
  - `GET /learning/progress` — 获取完整学习进度
  - `PUT /learning/progress` — 全量覆盖学习进度（简单粗暴，MVP 阶段够用）
  - `POST /learning/sync` — 增量同步（带 `updatedAt` 时间戳做冲突检测，后端取较新的）
- 验证：Postman/curl 测试 CRUD 正常

#### 2.5 前端学习进度云端同步（P1，约 3h）

**目标**：learn store 数据在登录状态下自动同步到云端

- 在 `useLearnStore` 中添加同步逻辑：
  - `syncToCloud()`：将本地 store 数据 PUT 到 `/learning/progress`
  - `syncFromCloud()`：GET 云端数据，合并到本地 store
  - 合并策略：以 `updatedAt` 较新的为准，字段级合并（charRecords 取并集，unitProgress 取星级较高的）
- 同步触发时机：
  - 登录成功后：拉取云端数据合并到本地
  - 单元完成时（`completeUnit`）：推送到云端
  - 应用切到后台时（`onHide`）：推送到云端
  - 应用恢复前台时（`onShow`）：拉取云端数据
- 离线兜底：未登录时仍使用本地 `persist: true` 存储，登录后自动合并上传
- 添加同步状态指示（可选）：首页显示「已同步」/「同步中」小图标
- 验证：登录 → 学习 → 杀掉小程序 → 重新打开 → 进度恢复

---

**阶段 2 交付物**：
- 可登录的微信小程序，学习进度云端持久化
- 后端 NestJS 服务（auth + user + learning 三个模块）
- 个人中心展示真实用户数据

**后端技术要点**：
- NestJS 11 + Mongoose + MongoDB（开发用 Atlas 免费集群，上线用微信云托管 + 云数据库）
- JWT 单 token 鉴权（MVP 阶段足够，后续可升级双 token）
- 参考 [nestjs_on_wechat.md](nestjs_on_wechat.md) 部署方案

**前端对接要点**：
- `api/login.ts` 和 `store/token.ts` 已封装完善，直接对接后端接口即可
- HTTP 层（`@/http/http`）需配置 `baseURL` 指向后端地址
- 微信云托管模式下可用 `wx.cloud.callContainer` 免鉴权调用（请求头自带 `x-wx-openid`）

---

### 阶段 3：复习与增长（第 4 周）

**目标**：让产品从「能用」变成「想用」

| # | 任务 | 优先级 | 约工时 |
|---|------|--------|--------|
| 3.1 | 艾宾浩斯遗忘曲线复习算法 | P1 | 4h |
| 3.2 | 藏宝阁接入已学汉字数据 | P2 | 3h |
| 3.3 | 打卡海报生成 + 分享 | P2 | 4h |
| 3.4 | 字库切换功能（首页） | P2 | 2h |

---

### 阶段 4：上线准备（第 5 周）

| # | 任务 | 说明 |
|---|------|------|
| 4.1 | 微信云开发环境配置 | 申请云开发，配置数据库/存储 |
| 4.2 | 小程序审核资质准备 | 教育类目资质、隐私政策、用户协议 |
| 4.3 | 性能优化 | 首屏加载、图片懒加载、分包加载 |
| 4.4 | 真机全流程测试 | iOS + Android 各主流机型 |
| 4.5 | 提交小程序审核 | 预留 3-7 天审核周期 |

---

## 三、任务依赖关系

```
0.1 Git 初始化
└── 0.2 验证可运行
    ├── 1.1 TTS 修复 ──────────────── 1.5 ASR 接入
    ├── 1.2 描红 Canvas 适配
    ├── 1.3 测验逻辑完善 ──────────── 1.6 单元测试页面 ── 1.7 结算打卡
    └── 1.4 进度本地持久化
        └── 2.x 用户体系
            └── 3.x 复习与增长
                └── 4.x 上线准备
```

---

## 四、风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 小程序审核被拒 | 中 | 高 | 提前准备教育类资质，避免涉及付费功能 |
| HanziWriter 小程序端不兼容 | 中 | 中 | 预研替代方案（自绘 Canvas 笔顺） |
| 语音 API 调用限制/费用 | 低 | 中 | 预留降级方案（跳过跟读步骤） |
| 用户留存不足 | 中 | 高 | 强化打卡 + 复习机制，种子用户内测收集反馈 |

---

## 五、当前待办（立即行动）

- [ ] **0.1** 初始化 Git，配置 `.gitignore`，首次提交
- [ ] **0.2** 运行 `pnpm dev`，确认 H5 模式可启动
- [ ] **1.1** 调试 TTS 语音播放问题

---

## 六、参考文档

- [产品原型设计](../design/product_prototype.md)
- [UI 设计规范](../design/ui_master_spec.html)
- [后端技术选型](backend_tech_analysis.md)
- [项目状态分析](project_status_analysis.md)
- [NestJS 微信云部署](nestjs_on_wechat.md)
- [开发准备指南](dev_preparation_guide.md)
