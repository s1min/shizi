# 产品原型设计方案：轻量级趣味识字伴侣

## 1. 产品概述
*   **产品名称**：(暂定) 趣字宝 / Little Hanzi
*   **平台**：微信小程序 (MVP) + App (后续)
*   **核心理念**：极简高效、字源解说、社交驱动。
*   **目标用户**：3-6岁学龄前儿童及其家长（尤其是追求效率、担心沉迷的家长）。

---

## 2. 信息架构 (IA)

### 2.1 站点地图 (Sitemap)
```mermaid
graph TD
    A[首页 (探险地图)] --> B[学习流程]
    A --> C[复习馆 (藏宝阁)]
    A --> D[成就中心 (我的)]
    
    B --> B1[字源动画]
    B1 --> B2[跟读互动]
    B2 --> B3[趣味描红]
    B3 --> B4[小测试 (多题型)]
    B4 --> B4a{完成本单元?}
    B4a -->|否| B1
    B4a -->|是| B5[单元测试 (综合闯关)]
    B5 --> B6[结算/打卡]
    
    C --> C1[已学汉字墙]
    C --> C2[每日复习任务]
    C --> C3[魔法造句 (AI阅读)]
    
    D --> D1[个人信息]
    D --> D2[学习日报]
    D --> D3[徽章成就]
    D --> D4[家长中心/设置]
```

---

## 3. 详细页面原型设计

### 3.1 首页：书架与课程 (Home - Bookshelf & Levels)
**设计目标**：弱化纯游戏感，采用更清晰、更像“学习工具”的**书架式/岛屿式**布局，明确字库分级。

*   **顶部状态栏**：
    *   **左侧**：当前选择的字库（如“一年级上册”），点击可切换。
    *   **右侧**：今日已学字数（进度环）、坚持天数。

*   **核心区域：分级地图 (Level Map)**：
    *   摒弃复杂的3D游戏地图，改为**扁平化岛屿**或**书架层级**设计。
    *   **三层结构**：字库 (Library) → 阶段 (Stage) → 单元 (Unit)
        *   **字库**：用户在顶部切换，对应一个完整的学习计划。
        *   **阶段**：每个字库分为若干阶段（每阶段 30-50 字），提供阶段性成就感。地图上以”大岛屿”或”章节封面”呈现。
        *   **单元**：每个阶段下分若干单元（每单元 5-8 字），是每次学习的最小闭环。地图上以”小岛屿”呈现。
    *   **视觉表现**：
        *   每个阶段是一片”大陆”，每个单元是大陆上的一个”岛屿”。
        *   **未解锁**：灰色锁状图标。
        *   **进行中**：高亮显示，配有”开始学习”按钮。
        *   **已完成**：显示获得的星星（1-3星），并有”复习”按钮。

*   **字库切换 (Library Switcher)**：
    *   点击顶部字库名称，底部弹出半屏菜单。
    *   **选项**：
        *   **学前启蒙** (约 200 字) - 适合 3-5 岁
            *   从一、二年级识字表中精选最高频、最具象的字，按难度重新编排。
            *   编排原则：象形字优先（日月水火山石田土）→ 简单会意字（大小上下）→ 高频生活字（爸妈家门）。
            *   分 4 个阶段，每阶段约 50 字。
        *   **一年级上册** (同步教材) - 适合 6 岁 / 入学同步
            *   完整收录教材识字表全部生字，保留教材课文单元顺序。
            *   阶段划分与教材单元一一对应。
        *   **一年级下册** (同步教材)
            *   同上，完整同步教材识字表。
        *   **二年级上册** (同步教材)
            *   同上，完整同步教材识字表。
        *   **二年级下册** (同步教材)
            *   同上，完整同步教材识字表。
    *   **字库说明**：
        *   教材同步字库与教材识字表完全一致，不做删减或重排，方便家长对照课本进度。
        *   各字库之间独立，不做去重。即使”学前启蒙”和”一年级上册”有重叠的字，也各自保留，因为使用场景和学习节奏不同。
        *   “学前启蒙”是唯一按学习难度重新编排的字库，其余字库严格跟随教材。

*   **底部导航栏**：
    *   学习 (Learn) - 首页
    *   藏宝阁 (Review)
    *   我的 (Profile)

---

### 3.2 核心学习流程 (The Learning Flow)
**设计目标**：单字闭环，时长控制在3-5分钟/字。

#### 步骤 1：字源动画 (Origin Animation)
*   **界面**：全屏展示。
*   **内容（按汉字类型分层）**：

    **A. 象形字 / 具象名词**（日、月、山、火、鱼、鸟、花、雨……）
    *   画面中心出现一个实物插画（例如：一团燃烧的**火**）。
    *   **动画**：实物慢慢线条化 -> 变成甲骨文 -> 变成楷书”火”。
    *   **语音**：旁白解说”火，燃烧的火堆，红红的火。”

    **B. 会意字 / 指事字**（上、下、本、休、明……）
    *   用**示意动画**代替实物插画。例如：
        *   “上”：一个小球从地面弹起，箭头向上，演变为”上”字。
        *   “休”：一个小人靠在树旁休息，”人 + 木 = 休”拆解动画。
        *   “明”：日和月合在一起发光。
    *   此类动画用 CSS 动画 / Lottie 实现，无需插画素材。

    **C. 抽象高频字**（的、了、是、在、很、也、不……）
    *   放弃单独的实物插画，改用**生活场景图 + 高亮句子**。例如：
        *   “大”：展示大象和小猫的对比场景，句子”大象很**大**，小猫很小”，”大”字高亮放大。
        *   “的”：展示一个红苹果的场景，句子”红红**的**苹果”，”的”字高亮。
    *   **语音**：朗读完整句子，目标字加重语气。
    *   场景图可用 AI 生成（统一风格的简笔画场景），也可用 emoji 组合临时替代。

*   **素材来源方案（个人开发者友好）**：
    *   **首选**：AI 生成插画（DALL·E / Stable Diffusion），统一提示词风格，如 `cute flat illustration, children's book style, simple, white background`，批量生成。
    *   **兜底**：系统 Emoji（🔥🌙⛰️💧🐟🐦🌸🌧️），MVP 阶段完全可用，儿童接受度高。
    *   **补充**：购买一套统一风格的图标包（Flaticon 等），覆盖常见物体。
    *   后续产品验证通过后，再请插画师统一优化视觉资产。

*   **交互**：自动播放，播放结束后出现”下一步”按钮（或自动跳转）。

#### 步骤 2：跟读互动 (Listen & Speak)
*   **界面**：
    *   屏幕中央展示大大的汉字“火”。
    *   下方有一个巨大的**麦克风图标**。
*   **交互**：
    *   系统示范读音：“huǒ - 火”。
    *   提示用户：“请大声读一遍”。
    *   用户长按麦克风跟读。
    *   **反馈**：
        *   识别成功：屏幕撒花/星星特效，语音夸奖“读得真准！”。
        *   识别失败：温柔提示“再试一次哦”。

#### 步骤 3：趣味描红 (Tracing)
*   **界面**：
    *   田字格背景，显示汉字轮廓。
    *   出现一只动态的小手（或毛笔）演示笔顺。
*   **交互**：
    *   用户手指跟随引导线描红。
    *   **容错机制**：如果画出界，笔迹消失，提示重写；如果笔顺错误，红色震动提示。
    *   写完后，汉字变成金色并闪烁。

#### 步骤 4：小测试 (Mini Quiz)
*   **设计理念**：借鉴斑马英语”学完即测”的模式，每学完一个字后进行即时测试，强化记忆。但汉字学习不同于英语单词——儿童已具备口语语义基础，核心难点在于**字形辨识**和**形近字区分**，因此采用**多题型随机组合**，而非单一的”看字选图”。
*   **题型池**（系统根据当前汉字特征智能选取 1-2 道题）：

    **题型 A：看字选图（适用于象形字、具象名词）**
    *   屏幕上方展示大字”火”，下方出现 3 张物体图片（火堆、水滴、大树）。
    *   孩子点击对应图片，强化”字形-实物”联结。
    *   *适用字举例：日、月、山、水、鱼、鸟、花、雨。*

    **题型 B：看图选字（核心题型，锻炼字形辨识）**
    *   屏幕上方展示一张物体图片（如火堆），下方出现 3 个**形近字**选项：火、大、太。
    *   迫使孩子精细辨认字形差异，这是汉字学习的关键能力。
    *   *适用字举例：大/太/犬、人/入、土/士、日/目。*

    **题型 C：听音选字（测试”音-形”联结）**
    *   播放语音”huǒ——火”，下方出现 3 个字供选择。
    *   适用于所有汉字，尤其适合抽象字（的、了、是、在）等无法用图片表达的高频字。

    **题型 D：语境选字（适用于抽象字、进阶阶段）**
    *   展示一个带空缺的短句 + 配图辅助理解，如：画面显示一个大人，句子为”这是一个___人”，选项：大、太、犬。
    *   帮助孩子在语境中理解抽象字的用法，为后续阅读打基础。
    *   *Level 2 及以上解锁此题型。*

*   **交互**：
    *   点击正确选项 -> 气球爆炸，飞出星星，语音夸奖。
    *   点击错误选项 -> 气球摇晃，发出”不不不”的音效，**并短暂高亮正确答案**帮助纠正。
    *   答错后该字会被标记，在后续的”单元测试”中再次出现。

#### 步骤 5：单元测试 (Unit Quiz) —— 学完一组字后的综合闯关
*   **设计理念**：借鉴斑马英语"学完一组词后集中测试"的模式。每学完一个单元（5-10个字）后，触发一次综合测试，将本单元所有新学汉字混合出题，强化整体记忆并检验学习效果。
*   **触发条件**：完成当前单元所有汉字的学习流程（步骤1-4）后自动进入。
*   **界面**：
    *   顶部进度条显示"第 1/8 题"。
    *   采用闯关形式，连续作答，营造节奏感。
*   **出题规则**：
    *   从本单元已学汉字中抽取，每字至少出现一次。
    *   题型从上述题型池（A/B/C/D）中智能组合，优先出"步骤4中答错的字"。
    *   形近字优先配对出题（如本单元同时学了"大"和"太"，必出看图选字对比题）。
*   **结果与激励**：
    *   全部答对：获得"单元之星"徽章 + 3颗星。
    *   正确率 ≥ 80%：获得 2 颗星，错题进入"藏宝阁"待复习队列。
    *   正确率 < 80%：获得 1 颗星，建议"再练一次"（可选，不强制）。

#### 步骤 6：结算与打卡 (Result & Share)
*   **界面**：
    *   显示本次学习成果：获得3颗星。
    *   **核心功能 - 打卡海报**：
        *   自动生成一张精美卡片。
        *   内容：“我是[宝宝昵称]，今天是我坚持识字的第5天，学会了[火]字。”
        *   背景：今日汉字的国潮插画。
        *   按钮：“分享到家庭群/朋友圈”（引导裂变）。

---

### 3.3 藏宝阁：复习中心 (Review Center)
**设计目标**：利用艾宾浩斯曲线巩固记忆，并提供**AI辅助阅读**功能。

*   **布局**：
    *   **今日待复习**：顶部大卡片，显示今日需要复习的字数。点击进入“闪卡模式”（快速认读）。
    *   **魔法造句 (NEW)**：一个醒目的“魔法书”图标入口。点击进入AI阅读角。
    *   **汉字墙**：下方网格状展示所有已学汉字。
        *   掌握得好的字：金色边框。
        *   需要加强的字：灰色或带有“复习”角标。

#### 3.3.1 魔法造句：AI阅读角 (Magic Sentence)
**设计目标**：通过语境记忆汉字，增加亲子互动。

*   **核心模式**：
    1.  **智能组句 (Smart Auto)**：系统根据孩子**已学汉字**，自动生成通顺的短句。
        *   *例：孩子学了“人、大、火”，AI生成：“大人看火。”*
    2.  **宝妈自选 (Mom's DIY)**：家长在“汉字墙”勾选特定汉字，AI针对性生成句子。
    3.  **自由输入 (Custom Input)**：家长直接输入一段文字（如绘本内容），AI自动转为“汉字+拼音”并朗读。

*   **阅读界面交互**：
    *   **大字展示**：屏幕中央展示生成的句子，每个汉字上方标注拼音。
    *   **AI领读**：点击播放按钮，标准童声朗读。
    *   **跟读挑战**：孩子录音读句子，AI打分，读得好奖励“智慧豆”。

---

### 3.4 我的：个人中心 (Profile & Parent Center)
**设计目标**：激励儿童持续学习，同时赋予家长掌控权。

#### 3.4.1 个人信息卡片 (User Info)
*   **布局**：页面顶部大卡片，采用圆角设计。
*   **内容**：
    *   **头像 (Avatar)**：点击可更换。提供 12 生肖卡通形象供孩子选择（如：机智猴、勤劳牛）。
    *   **昵称**：显示宝宝名字（如“乐乐”）。
    *   **等级/称号**：显示当前段位（如“识字小童生”、“翰林学士”），点击可看升级进度条。
    *   **ID 号**：用于加好友或客服查询。

#### 3.4.2 学习日报 (Daily Report)
*   **设计**：数据可视化区域。
*   **内容**：
    *   **今日数据**：学习时长（分钟）、新学字数、复习字数。
    *   **周趋势图**：简单的柱状图，展示过去 7 天的学习活跃度（星星数量）。
    *   **总成就**：累计识字量（如“已认识 128 个字，超过了 80% 的小朋友”）。

#### 3.4.3 徽章与成就 (Achievements)
*   **布局**：横向滚动的徽章墙或网格展示。
*   **内容**：
    *   **勋章墙**：
        *   *坚持之星*（连续打卡 3/7/30 天）。
        *   *博学多才*（识字量突破 100/500/1000）。
        *   *早起鸟*（早上 8 点前完成打卡）。
    *   **未解锁勋章**：显示灰色剪影，点击提示解锁条件，激励孩子。
    *   **汉字图鉴**：入口，点击进入可查看收集到的所有汉字精美卡片。

#### 3.4.4 家长中心/设置 (Parent Center)
*   **安全锁**：点击“设置”图标时，弹出一道简单的算术题（如“12 + 5 = ?”），防止误操作。
*   **功能模块**：
    *   **宝宝档案**：修改昵称、性别、出生日期（用于推荐适龄内容）。
    *   **学习配置**：
        *   *每日新字*：3个 / 5个 / 10个（默认 5 个）。
        *   *难度偏好*：优先人教版 / 优先高频字。
    *   **护眼与提醒**：
        *   *单次时长限制*：15分钟 / 30分钟（强制休息）。
        *   *学习提醒*：每天晚上 8 点推送微信通知。
    *   **系统设置**：背景音乐音量、音效开关、清除缓存、关于我们。

---

## 4. 视觉设计风格指南 (Visual Style Guide)
> **设计图预览**：请用浏览器打开 `design/ui_design_spec.html` 查看高保真设计规范长图。

*   **主色调**：
    *   **暖黄 (#FFD700)**：象征活力、快乐（主按钮、背景）。
    *   **天蓝 (#87CEEB)**：象征智慧、沉静（辅助色）。
    *   **纸张 (#FFFBF0)**：纸张颜色。
*   **字体**：
    *   汉字主体：使用**楷体**或**圆体**（笔画清晰，适合儿童辨识）。
    *   UI文字：圆润的无衬线字体。
*   **插画风格**：
    *   **扁平国潮风 (Flat Guochao)**。
    *   线条简单圆润，色彩明快但不刺眼（低饱和度）。
    *   避免过于复杂的3D渲染，保持界面清爽。
*   **插画素材来源策略（个人开发者适用）**：
    *   **阶段一 (MVP)**：
        *   象形字/具象名词：AI 生成插画（统一提示词风格） + 系统 Emoji 兜底。
        *   会意字/指事字：CSS 动画 / Lottie 动效，无需插画。
        *   抽象高频字：AI 生成生活场景图，配合高亮句子。
    *   **阶段二 (优化)**：购买统一风格图标包替换 Emoji，优化 AI 生成图的一致性。
    *   **阶段三 (成熟)**：聘请插画师统一绘制视觉资产，建立完整的汉字插画库。

## 5. 交互设计原则
1.  **大触控区**：考虑到儿童手指精细度不够，按钮尺寸至少要在 80x80rpx 以上。
2.  **即时反馈**：每一次点击、拖拽都必须有视觉（动画）或听觉（音效）反馈。
3.  **防误触**：关键操作（如退出、购买）增加”长按”或”双击”确认机制。

---

## 6. 数据库设计 (Database Design)

### 6.1 技术选型

采用**自建后端**方案，不使用微信云开发。

*   **选型理由**：
    *   产品规划为"微信小程序 (MVP) + App (后续)"，自建后端天然支持多端共用同一套 API，后续扩展 App 时后端零改动。
    *   微信云开发强绑定微信生态，云数据库不支持 MySQL，且 App 端无法直接调用云函数，未来迁移成本高。
    *   MySQL + MongoDB 双数据库架构能精确匹配两类数据的不同特征（见下文）。

*   **后端技术栈**：
    | 组件 | 技术选型 | 说明 |
    |------|---------|------|
    | 运行时 | Node.js (v18 LTS) | JavaScript 全栈，降低前后端切换成本 |
    | Web 框架 | Koa2 / Express | 轻量级，适合 RESTful API |
    | MySQL ORM | Prisma | 类型安全、自动迁移、开发体验好 |
    | MongoDB 驱动 | Mongoose | 成熟的 ODM，Schema 验证 |
    | 鉴权 | JWT + 微信登录 | 小程序 `wx.login()` → 后端换取 openid → 签发 JWT |
    | 部署 | Docker Compose | MySQL + MongoDB + Node.js 一键部署 |
    | 服务器 | 轻量云服务器 | 腾讯云/阿里云 2C2G 即可，约 50-100 元/月 |

*   **数据库分工**：
    *   **MongoDB**：存储内容数据（汉字元数据、字库编排）。汉字属性结构灵活，不同类型的字携带的字段不完全一致，文档模型比关系表更适合。读多写少，无需 JOIN。
    *   **MySQL**：存储用户业务数据（账号、档案、学习进度、记录、成就、设置）。结构固定，需要外键约束、事务支持、精确的时间查询（艾宾浩斯复习）。

### 6.2 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    客户端 (Client)                        │
│   ┌──────────────┐              ┌──────────────┐        │
│   │  微信小程序    │              │  App (后续)   │        │
│   │  (MVP)        │              │  (React Native)│       │
│   └──────┬───────┘              └──────┬───────┘        │
└──────────┼─────────────────────────────┼────────────────┘
           │         HTTPS / JWT         │
           ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Node.js 后端服务 (Koa2)                   │
│                                                         │
│   ┌─ RESTful API ────────────────────────────────────┐  │
│   │  /api/auth/*        用户鉴权（微信登录 → JWT）     │  │
│   │  /api/libraries/*   字库与单元查询                 │  │
│   │  /api/characters/*  汉字元数据查询                 │  │
│   │  /api/progress/*    学习进度读写                   │  │
│   │  /api/records/*     学习记录                      │  │
│   │  /api/achievements/* 成就徽章                     │  │
│   │  /api/settings/*    家长配置                      │  │
│   └──────────────────────────────────────────────────┘  │
│                                                         │
│   ┌─ Service 层 ─────────────────────────────────────┐  │
│   │  Prisma (MySQL ORM)    Mongoose (MongoDB ODM)    │  │
│   └──────┬──────────────────────────┬────────────────┘  │
└──────────┼──────────────────────────┼───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐  ┌──────────────────────┐
│    MySQL (业务数据)    │  │  MongoDB (内容数据)   │
│                      │  │                      │
│  users               │  │  characters          │
│  children            │  │  libraries           │
│  user_progress       │  │                      │
│  learning_records    │  │                      │
│  achievements        │  │                      │
│  settings            │  │                      │
└──────────────────────┘  └──────────────────────┘
```

### 6.3 MongoDB 内容数据

采用**元数据与编排分离**的设计：
*   `characters` 集合：存储所有汉字的属性信息（拼音、部首、笔画、形近字、教学素材等），全局唯一，不属于任何字库。
*   `libraries` 集合：存储字库的编排结构（阶段、单元、字的顺序），只引用汉字的 `_id`，不重复存储汉字属性。

**映射关系**：`libraries` 中的 `chars` 数组存储汉字 `_id`，通过 `$in` 查询批量获取 `characters` 元数据。新增字库只需在 `libraries` 中添加一条文档，`characters` 中补入新出现的字即可。各字库独立编排，互不影响。

#### 6.3.1 Collection: `characters` — 汉字元数据

每个文档代表一个汉字，`_id` 即汉字本身。

```json
// 象形字示例
{
  “_id”: “火”,
  “pinyin”: “huǒ”,
  “char_type”: “象形”,       // 象形 | 会意 | 指事 | 形声 | 抽象
  “radical”: “火”,
  “strokes”: 4,
  “stroke_order”: “4334”,
  “similar_chars”: [“大”, “太”, “犬”],
  “example_words”: [“火车”, “大火”, “火山”],
  “example_sentences”: [
    { “text”: “红红的火真暖和”, “highlight_index”: 3 }
  ],
  “teaching”: {
    “animation_type”: “origin”,  // origin | decompose | scene
    “origin_desc”: “一团燃烧的火堆，火苗向上窜”,
    “image_asset”: “assets/images/fire.png”,
    “emoji_fallback”: “🔥”
  }
}

// 会意字示例
{
  “_id”: “休”,
  “pinyin”: “xiū”,
  “char_type”: “会意”,
  “radical”: “亻”,
  “strokes”: 6,
  “stroke_order”: “321234”,
  “similar_chars”: [“体”, “林”],
  “example_words”: [“休息”, “休假”],
  “example_sentences”: [
    { “text”: “走累了，坐下来休息”, “highlight_index”: 6 }
  ],
  “teaching”: {
    “animation_type”: “decompose”,
    “decompose_parts”: [“亻(人)”, “木”],
    “decompose_desc”: “一个人靠在树旁休息”,
    “image_asset”: null,
    “emoji_fallback”: “😴”
  }
}

// 抽象字示例
{
  “_id”: “的”,
  “pinyin”: “de”,
  “char_type”: “抽象”,
  “radical”: “白”,
  “strokes”: 8,
  “stroke_order”: “32511354”,
  “similar_chars”: [“地”, “得”],
  “example_words”: [“我的”, “红的”],
  “example_sentences”: [
    { “text”: “红红的苹果”, “highlight_index”: 2 }
  ],
  “teaching”: {
    “animation_type”: “scene”,
    “scene_desc”: “展示一个红苹果，高亮'的'字”,
    “image_asset”: null,
    “emoji_fallback”: “🍎”
  }
}
```

**字段说明**：
| 字段 | 说明 | 数据来源 |
|------|------|----------|
| `_id` | 汉字本身，天然唯一 | 教材识字表手动录入 |
| `pinyin` | 拼音（含声调） | 手动录入 |
| `char_type` | 汉字类型，决定教学路径 | AI 批量标注 + 人工校对 |
| `radical` | 部首 | 开源汉字库 (makemeahanzi) |
| `strokes` | 笔画数 | 开源汉字库 |
| `stroke_order` | 笔顺编码 | 开源汉字库 |
| `similar_chars` | 形近字，用于测试干扰项 | AI 批量生成 + 人工校对 |
| `example_words` | 常用组词 | AI 生成 |
| `example_sentences` | 例句 + 目标字位置索引 | AI 生成（限定已学字范围） |
| `teaching` | 教学素材配置 | 根据 char_type 分类填充 |

#### 6.3.2 Collection: `libraries` — 字库编排

每个文档代表一个字库，内部按 阶段 → 单元 → 字列表 三层嵌套。

```json
{
  “_id”: “lib_1a_upper”,
  “name”: “一年级上册”,
  “type”: “textbook_sync”,
  “description”: “人教版一年级上册识字表同步”,
  “target_age”: “6岁”,
  “total_chars”: 300,
  “stages”: [
    {
      “id”: “stage_1”,
      “name”: “第一单元”,
      “units”: [
        {
          “id”: “unit_1”,
          “name”: “天地人”,
          “chars”: [“天”, “地”, “人”, “你”, “我”, “他”]
        },
        {
          “id”: “unit_2”,
          “name”: “金木水火土”,
          “chars”: [“一”, “二”, “三”, “四”, “五”, “金”, “木”, “水”, “火”, “土”]
        }
      ]
    },
    {
      “id”: “stage_2”,
      “name”: “第二单元”,
      “units”: [
        {
          “id”: “unit_3”,
          “name”: “口耳目”,
          “chars”: [“口”, “耳”, “目”, “手”, “足”, “站”, “坐”]
        }
      ]
    }
  ]
}
```

```json
{
  “_id”: “lib_preschool”,
  “name”: “学前启蒙”,
  “type”: “curated”,
  “description”: “精选高频具象字，按难度编排”,
  “target_age”: “3-5岁”,
  “total_chars”: 200,
  “stages”: [
    {
      “id”: “stage_1”,
      “name”: “象形字启蒙”,
      “units”: [
        {
          “id”: “unit_1”,
          “name”: “自然万物”,
          “chars”: [“日”, “月”, “水”, “火”, “山”, “石”, “田”, “土”]
        }
      ]
    }
  ]
}
```

**字库列表**：
| _id | 名称 | 类型 | 说明 |
|-----|------|------|------|
| `lib_preschool` | 学前启蒙 | curated | 按难度重新编排，约 200 字 |
| `lib_1a_upper` | 一年级上册 | textbook_sync | 严格同步教材识字表 |
| `lib_1a_lower` | 一年级下册 | textbook_sync | 严格同步教材识字表 |
| `lib_2a_upper` | 二年级上册 | textbook_sync | 严格同步教材识字表 |
| `lib_2a_lower` | 二年级下册 | textbook_sync | 严格同步教材识字表 |

### 6.4 查询方式

用户进入学习流程时，两步查询：

```javascript
// 第一步：从字库中获取当前单元的字列表
const library = await db.collection('libraries').findOne({ _id: 'lib_1a_upper' });
const unit = library.stages[0].units[0];
const charList = unit.chars;  // [“天”, “地”, “人”, “你”, “我”, “他”]

// 第二步：批量获取汉字元数据
const characters = await db.collection('characters')
  .find({ _id: { $in: charList } })
  .toArray();
```

### 6.5 数据填充步骤

1.  **手动录入**：从教材识字表录入每个字的 `_id`（汉字）和 `pinyin`，这是基础数据，必须人工确认准确。
2.  **开源库匹配**：下载 makemeahanzi 数据库，批量匹配 `radical`、`strokes`、`stroke_order`（同时获得描红环节所需的笔顺 SVG）。
3.  **AI 批量标注**：用 AI 批量生成 `char_type`、`similar_chars`、`example_words`、`example_sentences`、`teaching` 相关字段。
4.  **人工校对**：抽查 AI 标注结果，重点校对 `char_type` 分类和 `similar_chars` 准确性。
5.  **组织字库**：按教材单元结构填充 `libraries` 集合，教材同步字库保持原始顺序。
6.  **筛选启蒙**：从全部汉字中筛选 200 字组成”学前启蒙”字库，按难度重新编排。

### 6.6 MySQL：用户业务数据

用户相关的结构化数据使用 MySQL 存储，通过 Prisma ORM 操作，与 MongoDB 的内容数据分离。

#### 表 1: `users` — 家长账号

```sql
CREATE TABLE users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    openid          VARCHAR(64)  NOT NULL UNIQUE COMMENT '微信 openid',
    unionid         VARCHAR(64)  DEFAULT NULL COMMENT '微信 unionid（多端打通）',
    phone           VARCHAR(20)  DEFAULT NULL COMMENT '手机号（可选绑定）',
    nickname        VARCHAR(50)  NOT NULL DEFAULT '' COMMENT '家长昵称',
    avatar_url      VARCHAR(255) DEFAULT NULL COMMENT '头像地址',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_unionid (unionid)
) COMMENT='家长账号表';
```

#### 表 2: `children` — 宝宝档案

一个家长可以管理多个孩子。

```sql
CREATE TABLE children (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL COMMENT '所属家长 id',
    nickname        VARCHAR(50)  NOT NULL COMMENT '宝宝昵称',
    avatar_key      VARCHAR(20)  DEFAULT 'monkey' COMMENT '头像标识（十二生肖）',
    gender          TINYINT      DEFAULT NULL COMMENT '0=女 1=男',
    birthday        DATE         DEFAULT NULL COMMENT '出生日期',
    current_library VARCHAR(30)  NOT NULL DEFAULT 'lib_preschool' COMMENT '当前字库 id',
    current_stage   VARCHAR(30)  DEFAULT NULL COMMENT '当前阶段 id',
    current_unit    VARCHAR(30)  DEFAULT NULL COMMENT '当前单元 id',
    level_title     VARCHAR(20)  NOT NULL DEFAULT '识字小童生' COMMENT '等级称号',
    total_stars     INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计星星数',
    streak_days     INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '连续打卡天数',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='宝宝档案表';
```

#### 表 3: `user_progress` — 每个字的掌握状态

记录每个孩子在每个字库中对每个字的学习状态，是复习系统（艾宾浩斯）的核心数据。

```sql
CREATE TABLE user_progress (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id        BIGINT UNSIGNED NOT NULL,
    library_id      VARCHAR(30)  NOT NULL COMMENT '字库 id',
    char_id         VARCHAR(4)   NOT NULL COMMENT '汉字（对应 MongoDB _id）',
    status          TINYINT      NOT NULL DEFAULT 0 COMMENT '0=未学 1=学习中 2=已掌握 3=需复习',
    correct_count   INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计答对次数',
    wrong_count     INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计答错次数',
    last_learned_at DATETIME     DEFAULT NULL COMMENT '最近学习时间',
    next_review_at  DATETIME     DEFAULT NULL COMMENT '下次复习时间（艾宾浩斯）',
    review_level    TINYINT      NOT NULL DEFAULT 0 COMMENT '复习等级（0-7，决定下次间隔）',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_child_lib_char (child_id, library_id, char_id),
    INDEX idx_next_review (child_id, next_review_at),
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) COMMENT='汉字掌握状态表';
```

`review_level` 对应艾宾浩斯间隔：
| review_level | 间隔 |
|:---:|:---:|
| 0 | 1 小时后 |
| 1 | 1 天后 |
| 2 | 2 天后 |
| 3 | 4 天后 |
| 4 | 7 天后 |
| 5 | 15 天后 |
| 6 | 30 天后 |
| 7 | 已掌握 |

#### 表 4: `learning_records` — 学习记录流水

每次学习会话的详细日志，用于生成学习日报和数据分析。

```sql
CREATE TABLE learning_records (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id        BIGINT UNSIGNED NOT NULL,
    library_id      VARCHAR(30)  NOT NULL,
    unit_id         VARCHAR(30)  NOT NULL COMMENT '单元 id',
    record_type     VARCHAR(20)  NOT NULL COMMENT 'learn=新学 / unit_quiz=单元测试 / review=复习',
    chars_learned   JSON         DEFAULT NULL COMMENT '本次学习的字列表',
    correct_chars   JSON         DEFAULT NULL COMMENT '答对的字列表',
    wrong_chars     JSON         DEFAULT NULL COMMENT '答错的字列表',
    stars_earned    TINYINT      NOT NULL DEFAULT 0 COMMENT '获得星星数（0-3）',
    duration_sec    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '学习时长（秒）',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_child_date (child_id, created_at),
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) COMMENT='学习记录流水表';
```

#### 表 5: `achievements` — 成就/徽章

```sql
CREATE TABLE achievements (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id        BIGINT UNSIGNED NOT NULL,
    badge_key       VARCHAR(30)  NOT NULL COMMENT '徽章标识',
    badge_name      VARCHAR(50)  NOT NULL COMMENT '徽章名称',
    unlocked_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_child_badge (child_id, badge_key),
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) COMMENT='成就徽章表';
```

预设徽章：
| badge_key | badge_name | 解锁条件 |
|-----------|-----------|----------|
| `streak_3` | 坚持之星 (铜) | 连续打卡 3 天 |
| `streak_7` | 坚持之星 (银) | 连续打卡 7 天 |
| `streak_30` | 坚持之星 (金) | 连续打卡 30 天 |
| `chars_100` | 博学多才 (铜) | 累计识字 100 |
| `chars_500` | 博学多才 (银) | 累计识字 500 |
| `chars_1000` | 博学多才 (金) | 累计识字 1000 |
| `early_bird` | 早起鸟 | 早上 8 点前完成打卡 |
| `unit_star` | 单元之星 | 单元测试全部答对 |

#### 表 6: `settings` — 家长配置

```sql
CREATE TABLE settings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id        BIGINT UNSIGNED NOT NULL UNIQUE,
    daily_new_chars TINYINT      NOT NULL DEFAULT 5 COMMENT '每日新字数：3/5/10',
    session_limit   TINYINT      NOT NULL DEFAULT 15 COMMENT '单次时长限制（分钟）：15/30',
    reminder_time   TIME         DEFAULT '20:00:00' COMMENT '每日提醒时间',
    bgm_volume      TINYINT      NOT NULL DEFAULT 70 COMMENT '背景音乐音量 0-100',
    sfx_enabled     TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '音效开关',
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) COMMENT='家长配置表';
```

### 6.7 后端 API 概览

小程序/App 通过 RESTful API 与后端通信，所有接口统一前缀 `/api/v1`。

#### 6.7.1 鉴权流程

```
小程序端                          后端服务                        微信服务器
  │                                │                               │
  │  1. wx.login() 获取 code       │                               │
  │ ──────────────────────────────>│                               │
  │                                │  2. code → openid + session   │
  │                                │ ─────────────────────────────>│
  │                                │<──────────────────────────────│
  │                                │                               │
  │                                │  3. 查找/创建 user 记录        │
  │                                │  4. 签发 JWT (含 userId)       │
  │  5. 返回 JWT token             │                               │
  │<───────────────────────────────│                               │
  │                                │                               │
  │  后续请求: Authorization: Bearer <token>                        │
```

#### 6.7.2 核心 API 列表

| 方法 | 路径 | 说明 | 数据源 |
|------|------|------|--------|
| POST | `/auth/login` | 微信登录，换取 JWT | MySQL |
| GET | `/libraries` | 获取所有字库列表 | MongoDB |
| GET | `/libraries/:id` | 获取字库详情（含阶段/单元结构） | MongoDB |
| GET | `/libraries/:id/units/:unitId/chars` | 获取单元内汉字元数据 | MongoDB |
| GET | `/children` | 获取当前用户的孩子列表 | MySQL |
| POST | `/children` | 创建宝宝档案 | MySQL |
| PUT | `/children/:id` | 更新宝宝档案 | MySQL |
| GET | `/progress/:childId` | 获取孩子的学习进度概览 | MySQL |
| GET | `/progress/:childId/review` | 获取今日待复习汉字 | MySQL + MongoDB |
| POST | `/progress/:childId/learn` | 提交单字学习结果 | MySQL |
| POST | `/records` | 提交学习记录（单元完成时） | MySQL |
| GET | `/records/:childId/daily` | 获取学习日报数据 | MySQL |
| GET | `/achievements/:childId` | 获取已解锁徽章 | MySQL |
| GET | `/settings/:childId` | 获取家长配置 | MySQL |
| PUT | `/settings/:childId` | 更新家长配置 | MySQL |

#### 6.7.3 关键接口示例

**获取单元学习数据**（合并 MongoDB 内容 + MySQL 进度）：

```javascript
// GET /api/v1/libraries/:libId/units/:unitId/chars?childId=xxx
async function getUnitChars(ctx) {
  const { libId, unitId } = ctx.params
  const { childId } = ctx.query

  // 1. 从 MongoDB 获取字库编排
  const library = await Library.findById(libId)
  const unit = library.stages
    .flatMap(s => s.units)
    .find(u => u.id === unitId)
  const charList = unit.chars

  // 2. 从 MongoDB 批量获取汉字元数据
  const characters = await Character.find({ _id: { $in: charList } })

  // 3. 从 MySQL 获取该孩子对这些字的进度
  const progress = await prisma.userProgress.findMany({
    where: {
      child_id: Number(childId),
      library_id: libId,
      char_id: { in: charList }
    }
  })

  ctx.body = { unit, characters, progress }
}
```

**提交学习结果并更新艾宾浩斯进度**：

```javascript
// POST /api/v1/progress/:childId/learn
// body: { libraryId, charId, isCorrect }
async function submitLearnResult(ctx) {
  const { childId } = ctx.params
  const { libraryId, charId, isCorrect } = ctx.request.body

  // 艾宾浩斯间隔（秒）
  const INTERVALS = [3600, 86400, 172800, 345600, 604800, 1296000, 2592000, null]

  await prisma.$transaction(async (tx) => {
    // 查找或创建进度记录
    let progress = await tx.userProgress.findUnique({
      where: {
        uk_child_lib_char: {
          child_id: Number(childId),
          library_id: libraryId,
          char_id: charId
        }
      }
    })

    if (!progress) {
      progress = await tx.userProgress.create({
        data: {
          child_id: Number(childId),
          library_id: libraryId,
          char_id: charId,
          status: 1,
          correct_count: isCorrect ? 1 : 0,
          wrong_count: isCorrect ? 0 : 1,
          last_learned_at: new Date(),
          next_review_at: new Date(Date.now() + INTERVALS[0] * 1000),
          review_level: 0
        }
      })
    } else {
      const newLevel = isCorrect
        ? Math.min(progress.review_level + 1, 7)
        : Math.max(progress.review_level - 1, 0)

      await tx.userProgress.update({
        where: { id: progress.id },
        data: {
          correct_count: { increment: isCorrect ? 1 : 0 },
          wrong_count: { increment: isCorrect ? 0 : 1 },
          review_level: newLevel,
          status: newLevel >= 7 ? 2 : (newLevel >= 1 ? 1 : 3),
          last_learned_at: new Date(),
          next_review_at: INTERVALS[newLevel]
            ? new Date(Date.now() + INTERVALS[newLevel] * 1000)
            : null
        }
      })
    }
  })

  ctx.body = { success: true }
}
```

### 6.8 部署方案

#### Docker Compose 一键部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:${MYSQL_PASSWORD}@mysql:3306/hanzi
      - MONGODB_URI=mongodb://mongo:27017/hanzi
      - JWT_SECRET=${JWT_SECRET}
      - WX_APPID=${WX_APPID}
      - WX_SECRET=${WX_SECRET}
    depends_on:
      - mysql
      - mongo

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_DATABASE=hanzi
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  mongo:
    image: mongo:7.0
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/conf:/etc/letsencrypt
    depends_on:
      - app

volumes:
  mysql_data:
  mongo_data:
```

#### 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核 |
| 内存 | 2 GB | 4 GB |
| 磁盘 | 40 GB SSD | 60 GB SSD |
| 带宽 | 3 Mbps | 5 Mbps |
| 预估月费 | ~50 元 | ~100 元 |

#### 上线前置事项

1.  **域名备案**：准备一个已备案的域名（如 `api.quzibaoo.com`），微信小程序要求后端接口域名必须备案且支持 HTTPS。
2.  **HTTPS 证书**：使用 Let's Encrypt 免费证书，通过 Certbot 自动申请和续期。
3.  **微信后台配置**：在小程序管理后台 → 开发管理 → 服务器域名中，添加 `https://api.quzibaoo.com` 为合法请求域名。
4.  **数据库初始化**：通过 Prisma Migrate 创建 MySQL 表结构，通过 MongoDB 导入脚本导入 `characters` 和 `libraries` 初始数据。
