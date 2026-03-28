# 趣字宝下一步工作计划（基于代码扫描）

> 生成日期：2026-03-27  
> 适用范围：`shizi-frontend` + `shizi-backend` + 部署脚本  
> 结论来源：项目文档对照 + 代码扫描 + 本地构建/测试验证

---

## 一、计划目标

当前项目已进入“上线前质量与交付阶段”。下一步工作重点不是继续堆功能，而是优先完成以下四类闭环：

1. 质量门禁闭环（type-check / test / e2e）
2. 接口契约闭环（前后端 method/path/参数一致）
3. 安全配置闭环（示例配置脱敏、密钥轮换）
4. 部署可执行闭环（部署文档、seed、SSL、环境一致）

---

## 二、当前状态摘要（扫描结论）

### 2.1 已具备

1. 前后端主流程已可跑通，核心模块存在（Auth/User/Learning/Character/Library）。
2. 后端可构建（`pnpm build` 通过）。
3. 前端可打包 H5（`pnpm build:h5` 通过）。
4. 视觉与交互整改多数已落地（Tab 文案、复习页闪卡、主色体系等）。

### 2.2 主要阻塞

1. 前端类型检查失败：缺失 `@ttou/uv-typings` 相关类型定义，`pnpm type-check` 不通过。
2. 前后端接口存在不一致项（HTTP method 与路径命名不完全一致）。
3. 后端 e2e 测试失败（Mongo 认证失败，测试环境耦合外部数据库）。
4. 配置安全风险：`.env.example` 出现敏感连接串样式，需立即整改。
5. 字库“可选状态”前后不一致（引导页、首页、seed 数据未完全对齐）。
6. 小程序分包未配置（`subPackages` 为空），与计划中的包体优化目标尚未闭环。

---

## 三、下一步任务清单（按优先级）

## P0（必须先做，阻塞上线）

### P0-1 前端类型门禁修复

**目标**：恢复 `pnpm -C shizi-frontend type-check` 通过。  
**工作项**：

1. 处理 `tsconfig.json` 中 `@ttou/uv-typings/*` 依赖缺失问题（安装或移除并替换为可用类型源）。
2. 统一本地/CI 环境下的 TypeScript 配置，避免“本地能打包、CI 卡类型”的情况。

**验收标准**：

1. `pnpm -C shizi-frontend type-check` exit code = 0。
2. 不引入新的类型回退 `any`。

### P0-2 安全配置基线整改

**目标**：清除仓库中的敏感信息风险。  
**工作项**：

1. 将 `shizi-backend/.env.example` 中数据库连接串改为占位模板。
2. 检查并清理所有示例配置中的真实密钥/凭据痕迹。
3. 若敏感凭据曾经暴露，执行密钥轮换（DB/JWT/微信密钥）。

**验收标准**：

1. 示例文件不包含真实可用凭据。
2. 团队可基于示例文件安全初始化环境。

### P0-3 前后端接口契约统一

**目标**：消除 API method/path/参数不一致。  
**工作项**：

1. 对齐 `auth/logout`、`user/updateInfo` 等接口 method。
2. 清理前端遗留示例 API（如未实现的 `auth/login`、`refreshToken`、`updatePassword`）与当前后端能力的冲突。
3. 对统一契约生成一份接口映射清单（前端 API 文件 -> 后端 Controller）。

**验收标准**：

1. 前端调用不再依赖“后端刚好兼容”的偶然行为。
2. 关键登录/用户信息/学习同步流程接口全量对齐。

### P0-4 测试门禁可运行化

**目标**：`test` 与 `e2e` 可稳定执行。  
**工作项**：

1. e2e 改为独立测试数据库或测试隔离策略，避免依赖生产/外部凭据。
2. 补齐后端核心模块最小测试覆盖（至少 Auth/Learning/Character/Library 的 service 层）。
3. 保证 e2e 测试可在干净环境一键运行。

**验收标准**：

1. `pnpm -C shizi-backend test` 通过。
2. `pnpm -C shizi-backend test:e2e` 通过。

---

## P1（上线前应完成）

### P1-1 字库可用性一致化

**目标**：用户可选字库与实际可用数据一致。  
**工作项**：

1. 统一 `onboarding`、`home`、`seed`、后端 `libraries` 数据状态。
2. 未上线字库在所有入口保持“不可选”或“即将上线”一致呈现。
3. 若开放新字库，补齐前后端与数据导入链路。

**验收标准**：

1. 用户不会选择到不可用字库。
2. 字库切换后数据可正常加载。

### P1-2 部署闭环补完

**目标**：按文档可重复部署。  
**工作项**：

1. 统一 seed 执行方式（容器内执行路径与文档一致）。
2. 完善 SSL 申请与续期操作说明。
3. 复核 `docker-compose.yml`、`nginx`、备份脚本和生产环境变量模板。

**验收标准**：

1. 新环境可按文档一键启动并导入数据。
2. 健康检查和基础 API 可通过。

### P1-3 小程序分包与包体优化

**目标**：满足小程序主包体积与加载要求。  
**工作项**：

1. 将学习重页面迁移到子包。
2. 检查主包体积与依赖冗余。

**验收标准**：

1. `subPackages` 配置生效。
2. 主包体积满足目标阈值（按当前上线标准执行）。

---

## 四、推荐执行顺序（建议 5 个工作日）

### Day 1

1. P0-1 类型门禁修复  
2. P0-2 安全配置整改

### Day 2

1. P0-3 接口契约统一  
2. 前后端联调回归

### Day 3

1. P0-4 测试门禁（unit + e2e）  
2. 修复测试暴露问题

### Day 4

1. P1-1 字库可用性一致化  
2. P1-2 部署闭环补完

### Day 5

1. P1-3 分包优化  
2. 上线前回归与验收清单复核

---

## 五、每项任务交付物

1. 代码改动（PR 或提交记录）
2. 命令验证结果（build/type-check/test/e2e）
3. 对应文档更新（部署、配置、接口映射）
4. 风险项关闭记录（安全、契约、可用性）

---

## 六、里程碑验收口径

### 里程碑 M1（P0 完成）

1. 前端 `type-check` 通过
2. 后端 `test` 与 `test:e2e` 通过
3. 接口契约无已知不一致
4. 示例配置无敏感信息

### 里程碑 M2（P1 完成）

1. 字库状态一致且可用
2. 部署文档可复现
3. 分包配置完成并通过构建验证

---

## 七、风险与应对

1. **测试环境依赖外部 DB**  
应对：引入测试专用数据库配置或 mock/内存库策略。

2. **单人并行推进导致战线过多**  
应对：严格按 P0 -> P1 顺序推进，不跨层并行。

3. **接口调整引发前端回归**  
应对：先建立接口映射清单，再逐项联调与回归。

---

## 八、附注

本计划已根据 2026-03-27 的代码现状重排优先级：  
“先保证可验证、可交付、可上线”，再扩展新功能。

---

## Execution Update (2026-03-27)

### Step 3: Mini Program Subpackage Optimization - Completed

Scope implemented:
- Added UniPages subpackage scan config in `shizi-frontend/vite.config.ts`:
  - `subPackages: ['src/subpkg-learning']`
- Migrated learning/review pages to subpackage root `src/subpkg-learning`:
  - `learn/index.vue`
  - `learn/unit-test.vue`
  - `learn/unit-complete.vue`
  - `review/index.vue`
- Updated all related navigation routes to subpackage paths:
  - `/subpkg-learning/learn/index`
  - `/subpkg-learning/learn/unit-test`
  - `/subpkg-learning/learn/unit-complete`
  - `/subpkg-learning/review/index`
- Moved learning-only components from main package to subpackage to reduce main-package payload:
  - from `src/components/learn/*`
  - to `src/subpkg-learning/components/learn/*`

Verification results:
- `pnpm -C shizi-frontend type-check` passed.
- `pnpm -C shizi-frontend build:h5` passed.
- `pnpm -C shizi-frontend build:mp` passed.
- `src/pages.json` now contains effective `subPackages` config:
  - root: `subpkg-learning`
  - pages: `learn/index`, `learn/unit-test`, `learn/unit-complete`, `review/index`
- Build output contains real subpackage artifacts under:
  - `dist/build/mp-weixin/subpkg-learning/*`

Size snapshot (mp-weixin build):
- `ALL_BYTES=408661`
- `MAIN_BYTES=336974`
- `SUBPKG_BYTES=71687`

Main-package reduction after moving learning components to subpackage:
- before: `MAIN_BYTES=366600`
- after: `MAIN_BYTES=336974`
- delta: `-29626` bytes

---

## Execution Update (2026-03-27)

### Step 4: Pre-release Regression & Acceptance Checklist Review - Completed

Scope implemented:
- Executed full local regression command matrix for frontend/backend.
- Verified subpackage optimization output is present and effective in mp-weixin artifacts.
- Added execution checklist document: `docs/release_readiness_checklist.md`.

Command results:
- Backend:
  - `pnpm -C shizi-backend build` PASS
  - `pnpm -C shizi-backend test` PASS
  - `pnpm -C shizi-backend test:e2e` PASS
- Frontend:
  - `pnpm -C shizi-frontend type-check` PASS
  - `pnpm -C shizi-frontend build:h5` PASS
  - `pnpm -C shizi-frontend build:mp` PASS

Environment blockers found:
- `docker compose config` FAIL due missing required env var: `JWT_SECRET` (also requires `WX_APPID`, `WX_APP_SECRET`).
- `docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .` FAIL due Docker Hub connectivity (`registry-1.docker.io:443` unreachable / HTTPS proxy issue).

Gate status:
- Code/build gate: PASS
- Deployment environment gate: BLOCKED (pending env + Docker Hub connectivity)

### Step 4 Supplement (2026-03-27)

- Rechecked compose parsing with temporary env placeholders:
  - `JWT_SECRET=local-check-secret`
  - `WX_APPID=local-check-appid`
  - `WX_APP_SECRET=local-check-secret`
  - `docker compose config` => PASS (compose file is valid)
- Therefore deployment blocker is confirmed as environment readiness (secret injection + local Docker runtime), not compose syntax.

### Step 4 Supplement 2 (2026-03-27, after Docker Desktop start)

- Rechecked Docker engine:
  - `docker info` => PASS (engine is running and reachable).
- Rechecked deployment commands:
  - `docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .` => FAIL
  - `docker compose up -d` (with temporary local-check env values) => FAIL
- Current failure reason has shifted to Docker Hub connectivity:
  - Cannot pull `node:20-alpine` / `nginx:alpine` from `registry-1.docker.io:443`.
  - Docker error indicates missing/invalid HTTPS proxy path in current network.

### Step 4 Supplement 3 (2026-03-27, deployment loop closed)

- Applied backend image build fix in `shizi-backend/Dockerfile`:
  - removed broad source copy that could overwrite container-installed dependencies.
  - switched to explicit copy of build inputs (`src`, `scripts`, `nest-cli.json`, `tsconfig*.json`).
- Added reproducible deployment verification entrypoints:
  - `.env.production.example` normalized as production secret template.
  - `scripts/verify-deploy.sh` (Linux/macOS) and `scripts/verify-deploy.ps1` (Windows PowerShell).
  - `scripts/verify-prod-env.sh` and `scripts/verify-prod-env.ps1` for pre-deploy secret validation.
  - `docs/device_regression_evidence.md` as iOS/Android evidence template.
  - `docs/deployment_guide.md` updated with one-command verification section.
- Re-ran deployment checks with temporary local-check env values:
  - `docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .` => PASS
  - `docker build --no-cache -f shizi-backend/Dockerfile -t shizi-backend:local-check .` => PASS
  - `docker compose up -d` => PASS (`app` / `mongo` / `nginx` all running)
  - `curl http://localhost/api/health` => PASS (`status=ok`)
  - `docker compose exec app node dist/scripts/seed.js` => PASS (257 chars + 1 library)
  - `curl http://localhost/api/libraries` => PASS (returns `lib_1a_upper`)
- Deployment gate status changed:
  - Local deployment gate: PASS
  - Remaining pre-submission items: production secret injection + iOS/Android manual regression evidence.

### Step 4 Supplement 4 (2026-03-27, local dev smoke closed)

- Switched backend local baseline config to:
  - `shizi-backend/.env` -> `PORT=8001`
  - `shizi-backend/.env` -> `MONGODB_URI=mongodb://localhost:27017/shizi`
- Aligned frontend local API target:
  - `shizi-frontend/env/.env` -> `VITE_SERVER_BASEURL=http://localhost:8001/api`
  - `shizi-frontend/env/.env` -> `VITE_SERVER_BASEURL_SECONDARY=http://localhost:8001/api`
- Verified standalone backend smoke (local process, non-docker):
  - `GET /api/health` => 200
  - `GET /api/libraries` => 200
  - `GET /api/libraries/lib_1a_upper` => 200
  - `GET /api/characters/batch?ids=人,口` => 200
  - `GET /api/user/info` (no token) => 401 (expected)

### Step 4 Supplement 5 (2026-03-27, frontend route deprecation cleanup)

- Root cause:
  - Multiple pages still used deprecated `<route/>` blocks.
- Fix implemented:
  - Migrated all page route metadata blocks to `definePage(...)`.
  - Preserved home-page semantics via `definePage({ type: 'home', ... })` for `pages/home/index`.
  - Removed residual `// @ts-nocheck` from `subpkg-learning/learn/unit-complete.vue`.
  - Fixed Canvas API typings in `subpkg-learning/learn/unit-complete.vue`:
    - `fields({ node, size }, callback).exec()`
    - `canvasToTempFilePath({ canvasId, canvas, ... }, instance?.proxy)`
- Verification:
  - `pnpm -C shizi-frontend type-check` => PASS
  - `pnpm -C shizi-frontend build:mp` => PASS
  - No `<route/>` deprecation warning appears in build output.

### Step 4 Supplement 6 (2026-03-27, frontend build warning cleanup)

- Root causes:
  - UnoCSS icon collection `carbon` was not registered, causing `i-carbon-*` load warnings.
  - Build flow attempted to auto-open WeChat DevTools with a fixed local path, causing noisy local-path warnings.
  - Component auto-scan only covered default dirs, causing `vite-plugin-uni-components no components found`.
- Fix implemented:
  - Updated `shizi-frontend/uno.config.ts` to register `carbon` icon collection from `@iconify-json/carbon`.
  - Updated `shizi-frontend/scripts/open-dev-tools.js`:
    - resolve CLI path from multiple Windows/macOS candidates and optional `WECHAT_DEVTOOLS_CLI`;
    - skip production auto-open by default (unless `UNI_AUTO_OPEN_DEVTOOLS=true`);
    - degrade gracefully with guidance logs when CLI is missing.
  - Updated `shizi-frontend/vite.config.ts` `UniComponents(...)` config:
    - `dirs: ['src/components', 'src/subpkg-learning/components']`.
- Verification:
  - `pnpm -C shizi-frontend build:mp` => PASS
  - Removed warnings:
    - `[unocss] failed to load icon "carbon-*"`
    - WeChat DevTools fixed-path open failure warning
    - `vite-plugin-uni-components no components found`
  - Remaining non-blocking dependency-layer warnings:
    - Browserslist stale data prompt (`caniuse-lite` update suggestion)
    - Node circular dependency warning (`finally` property)

### Step 4 Supplement 7 (2026-03-27, H5/MP pages.json duplication stabilization)

- Root cause:
  - `src/pages.json` is generated/merged by `vite-plugin-uni-pages`.
  - Cross-platform repeated builds may keep stale merged entries and trigger:
    - `[uni-app] Error: pages.json->pages/home/index duplication`
- Fix implemented:
  - Added prebuild cleanup script: `shizi-frontend/scripts/clean-generated-pages.js`
    - removes generated `src/pages.json` before build.
  - Wired into build lifecycle in `shizi-frontend/package.json`:
    - `prebuild:h5`
    - `prebuild:mp`
- Verification:
  - `pnpm -C shizi-frontend build:mp` => PASS
  - `pnpm -C shizi-frontend build:h5` => PASS
  - No duplicate page-path error after switching build targets.

### Step 5 (2026-03-28, Device Regression Bug-Tracking Loop Added) - Completed

- Added reusable bug-tracking assets for real-device testing:
  - `docs/bug_reports/README.md` (workflow, severity, status, naming, handoff minimum fields).
  - `docs/bug_reports/_bug_report_template.md` (single-bug template).
  - `docs/bug_reports/session_2026-03-28.md` (daily session ledger).
- Linked existing regression docs to bug ledger workflow:
  - `docs/device_regression_evidence.md` now includes session ledger path and `Bug IDs` column.
  - `docs/release_readiness_checklist.md` now requires:
    - session bug ledger maintenance;
    - per-bug detailed reports from template;
    - evidence file with linked Bug IDs.
- Outcome:
  - Real-device testing now has a closed-loop path: discover -> log -> fix -> regress -> close.
  - Remaining action for submission gate: fill iOS/Android evidence and close `S0`/`S1` issues in ledger.

### Step 6 (2026-03-28, GitHub Issues Workflow Landing) - Completed

- Migrated collaboration baseline to GitHub Issues as primary bug source.
- Added issue template assets:
  - `.github/ISSUE_TEMPLATE/bug.yml`
  - `.github/ISSUE_TEMPLATE/config.yml`
- Added automation scripts:
  - `scripts/bootstrap-github-labels.ps1` (idempotent label setup/update)
  - `scripts/sync-github-issues.ps1` (sync open bug issues to local JSON)
- Added workflow documentation:
  - `docs/github_issues_workflow.md`
  - updated `docs/bug_reports/README.md` to make GitHub Issues the default source.
- Validation:
  - both PowerShell scripts pass parse check.
  - workflow can run with `GITHUB_TOKEN` + repository `origin` auto-detection.
