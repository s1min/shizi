# 趣字宝项目主计划（整合版）

> 版本：v1.0（整合版）  
> 更新日期：2026-03-27  
> 适用阶段：MVP 上线前冲刺  
> 文档定位：统一项目计划主文档（Single Source of Truth）

---

## 一、文档目的

本文件用于整合以下计划文档，统一“现状判断、任务优先级、执行节奏、验收标准”：

1. `docs/project_plan.md`（MVP 初版计划）
2. `docs/development_plan.md`（后续开发计划）
3. `docs/next_step_work_plan.md`（基于代码扫描的近期工作计划）

后续排期、执行、验收，以本文件为主；其余计划文档作为历史参考。

---

## 二、当前基线（截至 2026-03-27）

## 2.1 已完成能力

1. 前端主流程基本可用：登录、首页、学习流程、复习、图鉴、我的等页面已具备。
2. 后端业务模块已具备：Auth/User/Learning/Character/Library。
3. 后端构建通过：`pnpm -C shizi-backend build`。
4. 前端 H5 打包通过：`pnpm -C shizi-frontend build:h5`。
5. 部署基础文件已存在：`Dockerfile`、`docker-compose.yml`、`nginx` 配置、备份脚本。

## 2.2 当前阻塞项（上线前必须处理）

1. 前端类型门禁失败：`pnpm -C shizi-frontend type-check` 失败（缺失 `@ttou/uv-typings`）。
2. API 契约存在不一致：前端与后端的 method/path 存在偏差（例如 `logout`、`updateInfo`）。
3. e2e 不稳定：`pnpm -C shizi-backend test:e2e` 因数据库认证失败而不可用。
4. 安全配置风险：示例配置出现敏感连接串信息，需立即脱敏并轮换凭据。
5. 字库状态不一致：引导页可选项、首页可用状态、后端 seed 数据未完全一致。
6. 小程序分包未落地：`subPackages` 仍为空，包体优化目标未收口。

---

## 三、总体目标（MVP 冲刺）

## 3.1 核心目标

1. 形成“可验证、可部署、可上线”的完整闭环。
2. 在保证质量门禁通过前提下，完成小程序上线准备。
3. 控制战线，不新增高风险功能分支，优先收敛既有能力。

## 3.2 上线判定标准（Gate）

1. 前端 `type-check`、后端 `build`、`test`、`test:e2e` 全部通过。
2. 关键业务路径联调通过：登录 -> 引导/字库 -> 学习 -> 进度同步 -> 复习。
3. 部署文档可复现：按文档可完成启动、seed、健康检查。
4. 示例配置完全脱敏，生产密钥独立管理。

---

## 四、阶段计划与优先级

## 阶段 A：质量收口（P0，预计 3-5 天）

### A1 前端类型门禁修复（P0）

1. 修复 `@ttou/uv-typings` 依赖问题（安装或配置替代）。
2. 确保 `pnpm -C shizi-frontend type-check` 通过。

### A2 安全配置整改（P0）

1. 清理 `*.env.example` 中敏感内容，统一占位模板。
2. 对已暴露凭据执行轮换（DB/JWT/小程序密钥）。

### A3 API 契约统一（P0）

1. 对齐前后端接口 method/path/参数。
2. 输出接口映射清单，避免后续再次漂移。

### A4 测试门禁可运行化（P0）

1. e2e 使用测试数据库或隔离策略，不依赖外部生产数据。
2. 增补核心 service 层测试（Auth/Learning/Character/Library）。

**阶段 A 验收**

1. 前端 `type-check` 通过。
2. 后端 `build`、`test`、`test:e2e` 通过。
3. API 契约清单完成且联调通过。
4. 安全整改完成并确认无敏感信息残留。

---

## 阶段 B：上线就绪（P1，预计 3-5 天）

### B1 字库可用性一致化（P1）

1. 统一 onboarding/home/backend/seed 的字库状态。
2. 未上线字库统一为不可选且文案一致。
3. 若开放新字库，补齐数据导入与接口返回。

### B2 部署闭环补完（P1）

1. 统一 seed 执行路径与部署文档。
2. 补全 SSL 申请与续期执行流程。
3. 复核 `docker-compose`、`nginx`、备份脚本、生产环境变量模板。

### B3 小程序分包优化（P1）

1. 配置 `subPackages`，迁移重页面至子包。
2. 验证主包体积与加载性能目标。

**阶段 B 验收**

1. 可按文档完成部署、初始化与健康检查。
2. 字库选择与实际可用数据一致。
3. 分包配置生效并通过构建验证。

---

## 阶段 C：提审准备（P0/P1，预计 2-4 天）

### C1 真机回归（P0）

1. 微信开发者工具全流程验证。
2. iOS/Android 至少各 1 台真机验证关键路径。

### C2 审核资料复核（P0）

1. 隐私政策与用户协议页面可访问、文案可用。
2. 服务器域名白名单、HTTPS、备案与类目策略确认。

### C3 提审清单执行（P1）

1. 按部署文档完成生产环境最终检查。
2. 提交审核并预留 3-7 天审核窗口。

**阶段 C 验收**

1. 核心路径在真机通过。
2. 审核材料齐备，无阻塞项。
3. 提审版本可追溯、可回滚。

---

## 阶段 D：上线后迭代（P2，按需）

1. 健康检查与请求日志增强。
2. 新字库扩展（如一年级下册）。
3. characters 批量查询缓存。
4. 前端图片懒加载与同步防抖优化。

---

## 五、里程碑与交付物

| 里程碑 | 目标 | 交付物 | 通过条件 |
|---|---|---|---|
| M1 | 质量收口完成 | 类型/测试通过记录、API 契约清单、安全整改记录 | 阶段 A 全部验收通过 |
| M2 | 上线就绪完成 | 可复现部署文档、分包配置、字库一致性修复 | 阶段 B 全部验收通过 |
| M3 | 提审完成 | 真机回归记录、审核材料、提审版本标识 | 阶段 C 全部验收通过 |

---

## 六、执行顺序（推荐）

1. 先做 P0（质量门禁与安全），不并行开启 P1。
2. P0 收口后再做 P1（部署与分包）。
3. P1 完成后进入提审准备，不在提审前新增范围外功能。

---

## 七、风险台账（当前）

| 风险 | 等级 | 说明 | 应对策略 |
|---|---|---|---|
| 前端类型门禁失败 | 高 | CI/交付不可控 | 优先修复类型依赖 |
| 接口契约漂移 | 高 | 联调不稳定、回归频发 | 建立契约清单并回归 |
| e2e 依赖外部 DB | 高 | 测试不稳定且不可复现 | 隔离测试环境 |
| 配置敏感信息泄露 | 高 | 安全与合规风险 | 立即脱敏+密钥轮换 |
| 字库状态不一致 | 中 | 用户路径中断 | 统一前后端可用性定义 |
| 分包未完成 | 中 | 审核/性能风险 | 阶段 B 完成分包优化 |

---

## 八、配套文档关系

1. 主计划：`docs/project_master_plan.md`（本文件）
2. 近期执行清单：`docs/next_step_work_plan.md`
3. 历史计划参考：`docs/project_plan.md`、`docs/development_plan.md`
4. 部署执行文档：`docs/deployment_guide.md`

---

## 九、变更管理规则

1. 每周至少更新一次“当前基线”和“风险台账”。
2. 新增任务必须标注优先级（P0/P1/P2）和验收标准。
3. 若任务影响上线范围，必须同步更新“里程碑通过条件”。
4. 禁止在未完成阶段 A 前新增非阻塞功能需求。

---

## 十、本周立即行动（执行版）

1. 修复前端 `type-check` 阻塞。
2. 完成示例配置脱敏与密钥轮换。
3. 对齐前后端 API 契约并完成联调。
4. 修复 e2e 的数据库依赖问题并跑通。
5. 统一字库可选状态与 seed 数据。
6. 补全分包配置并完成构建验证。


---

## Execution Log (2026-03-27)

### B3 Completed
- Mini Program subpackage optimization completed and verified.
- Effective root: `subpkg-learning`.
- Build output contains `dist/build/mp-weixin/subpkg-learning/*`.

### C Phase Started
- Pre-release regression command matrix executed.
- Code/build gate: PASS (`frontend type-check/build`, `backend build/test/test:e2e`).
- Deployment environment gate: BLOCKED.
- Latest blocker status:
  - Docker engine availability: PASS (`docker info`).
  - Compose schema validation: PASS with temporary env placeholders.
  - Image pull/startup: FAIL due Docker Hub connectivity (`registry-1.docker.io:443` unreachable / HTTPS proxy not configured).
- Detailed checklist: `docs/release_readiness_checklist.md`.

### C Phase Update (Deployment Loop Closed)
- Applied backend Dockerfile build fix to avoid overwriting container-installed dependencies during build context copy.
- Added deploy-verification assets for repeatable execution:
  - `.env.production.example` production secret template.
  - `scripts/verify-deploy.sh` and `scripts/verify-deploy.ps1` one-command checks.
  - `scripts/verify-prod-env.sh` and `scripts/verify-prod-env.ps1` production secret validators.
  - `docs/device_regression_evidence.md` to collect iOS/Android evidence.
  - `docs/deployment_guide.md` entrypoint update.
- Re-validated deployment chain with local-check env values:
  - `docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .` PASS
  - `docker build --no-cache -f shizi-backend/Dockerfile -t shizi-backend:local-check .` PASS
  - `docker compose up -d` PASS (`app` / `mongo` / `nginx` running)
  - `curl http://localhost/api/health` PASS
  - `docker compose exec app node dist/scripts/seed.js` PASS
  - `curl http://localhost/api/libraries` PASS
- Closed local standalone smoke baseline:
  - backend `.env` switched to local Mongo + `PORT=8001`
  - frontend local API base switched to `http://localhost:8001/api`
  - core public APIs verified 200; protected API verified 401 without token
- Gate adjustment:
  - Code/build gate: PASS
  - Local deployment gate: PASS
  - Remaining submission blockers: production secret injection + iOS/Android device regression evidence.

### C Phase Update (Frontend Build Warning Closure)
- Closed non-functional but noisy frontend build warnings in mini-program pipeline:
  - registered UnoCSS `carbon` icon collection (`@iconify-json/carbon`);
  - hardened WeChat DevTools auto-open script with multi-path detection + optional env override (`WECHAT_DEVTOOLS_CLI`);
  - production build now does not auto-open DevTools unless `UNI_AUTO_OPEN_DEVTOOLS=true`;
  - widened `UniComponents` scan dirs to include `src/subpkg-learning/components`.
- Re-verified:
  - `pnpm -C shizi-frontend build:mp` PASS
  - Route deprecation / UnoCSS icon / DevTools fixed-path / component-scan warnings removed.
- Current residual warnings (non-blocking, dependency-level):
  - Browserslist stale data prompt (`caniuse-lite` needs refresh)
  - Node circular dependency warning (`finally`)

### C Phase Update (Cross-platform Build Stabilization)
- Resolved cross-platform repeated-build instability on generated `pages.json`:
  - issue symptom: H5 build could fail with `pages/home/index duplication` after platform switching.
  - root cause: stale merged entries in generated `src/pages.json`.
- Implemented preventive guard:
  - added `shizi-frontend/scripts/clean-generated-pages.js`;
  - hooked to `prebuild:h5` and `prebuild:mp` in `shizi-frontend/package.json`.
- Re-verified:
  - `pnpm -C shizi-frontend build:mp` PASS
  - `pnpm -C shizi-frontend build:h5` PASS

### C Phase Update (Device Regression Bug-Tracking Workflow)
- Added a reusable bug-tracking bundle for C1 real-device regression:
  - `docs/bug_reports/README.md`
  - `docs/bug_reports/_bug_report_template.md`
  - `docs/bug_reports/session_2026-03-28.md`
- Connected submission artifacts to bug IDs:
  - `docs/device_regression_evidence.md` now includes a `Bug IDs` column per core flow.
  - `docs/release_readiness_checklist.md` now requires session ledger + per-bug reports before gate review.
- Gate implication:
  - C1 execution is no longer blocked by “how to record bugs”.
  - Remaining C-phase blockers stay the same: production secret injection + iOS/Android evidence completion.
