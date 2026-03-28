# Release Readiness Checklist (Execution Edition)

> Version: v1.0
> Execution date: 2026-03-27
> Scope: `shizi-frontend` + `shizi-backend` + deployment baseline
> Plan reference: `docs/project_master_plan.md` Phase C

---

## 1. Automated Regression Results

| Area | Command | Result | Note |
|---|---|---|---|
| Backend build | `pnpm -C shizi-backend build` | PASS | NestJS build succeeded |
| Backend unit test | `pnpm -C shizi-backend test` | PASS | `src/app.controller.spec.ts` passed |
| Backend e2e test | `pnpm -C shizi-backend test:e2e` | PASS | `test/app.e2e-spec.ts` passed |
| Frontend type check | `pnpm -C shizi-frontend type-check` | PASS | `vue-tsc --noEmit` passed |
| Frontend H5 build | `pnpm -C shizi-frontend build:h5` | PASS | Build succeeded with `prebuild:h5` generated-file cleanup, route metadata migrated to `definePage(...)` |
| Frontend mini-program build | `pnpm -C shizi-frontend build:mp` | PASS | Subpackage build succeeded with `prebuild:mp` generated-file cleanup; route/icon/devtools/component-scan warnings cleaned |

---

## 2. Subpackage Verification (Step 3)

| Check | Result | Evidence |
|---|---|---|
| `pages.json` contains `subPackages` | PASS | root=`subpkg-learning`; pages include `learn/index`, `learn/unit-test`, `learn/unit-complete`, `review/index` |
| Real subpackage output exists | PASS | `dist/build/mp-weixin/subpkg-learning/*` exists |
| Main-package size optimization landed | PASS | Main package reduced from `366600` bytes to `336974` bytes (delta `-29626` bytes) |

---

## 3. Deployment Baseline Checks

| Check | Command | Result | Conclusion |
|---|---|---|---|
| Compose config parsing (without env) | `docker compose config` | FAIL | Missing required env vars (`JWT_SECRET`; also requires `WX_APPID`, `WX_APP_SECRET`) |
| Compose config parsing (with temp env) | set `JWT_SECRET/WX_APPID/WX_APP_SECRET` then `docker compose config` | PASS | Compose file itself is valid |
| Docker engine availability | `docker info` | PASS | Docker Desktop engine is running and reachable |
| Local backend image build | `docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .` | PASS | Build succeeded after Dockerfile copy-scope fix; no-cache rebuild also passed |
| Local compose startup (temp env) | set `JWT_SECRET/WX_APPID/WX_APP_SECRET` then `docker compose up -d` | PASS | `app` / `mongo` / `nginx` containers all running |
| Health check endpoint | `curl http://localhost/api/health` | PASS | Returns `status=ok` |
| Seed execution | `docker compose exec app node dist/scripts/seed.js` | PASS | Imported 257 characters and 1 library (`lib_1a_upper`) |
| Library API check | `curl http://localhost/api/libraries` | PASS | Returns non-empty data (`lib_1a_upper`) |
| One-command verification script | `powershell -ExecutionPolicy Bypass -File scripts/verify-deploy.ps1` | PASS | Full chain check passed (`config/build/up/health/seed/libraries`) |
| Production env validator script | `powershell -ExecutionPolicy Bypass -File scripts/verify-prod-env.ps1 -EnvFile .env` | PASS | Validation passes with non-placeholder strong secrets (checked on a sample env file) |
| Local standalone backend smoke (PORT=8001) | `pnpm -C shizi-backend start` + curl checks | PASS | `/api/health`, `/api/libraries`, `/api/libraries/lib_1a_upper`, `/api/characters/batch` return 200; `/api/user/info` returns expected 401 without token |

Notes:
- `docker compose config` without env remains expected-fail by design because required secrets are intentionally not committed.
- Local deployment loop (build -> up -> health -> seed -> list APIs) is now reproducible.
- Local dev baseline now uses `shizi-backend/.env` (`PORT=8001`, local Mongo URI) to avoid Docker `8000` port conflict and Atlas auth instability.
- Frontend build lifecycle now removes generated `src/pages.json` before `build:h5` / `build:mp` to avoid cross-platform duplicate-route merge drift.
- Remaining non-blocking frontend build warnings are dependency-level:
  - Browserslist data is stale (`caniuse-lite` refresh prompt).
  - Node circular dependency warning on `finally`.

---

## 4. Manual Regression Checklist (Must-do before submission)

### 4.1 Device regression (P0)

- [ ] iOS device flow: login -> home -> learn -> unit test -> review -> back to home
- [ ] Android device flow: same as above
- [ ] First subpackage page load has no white screen and no route errors
- [ ] `pages/privacy/index` and `pages/agreement/index` are reachable in mini-program
- [ ] Session bug ledger is maintained: `docs/bug_reports/session_YYYY-MM-DD.md`
- [ ] Confirmed issues have individual reports from `docs/bug_reports/_bug_report_template.md`
- [ ] Evidence file completed with linked Bug IDs: `docs/device_regression_evidence.md`

### 4.2 Deployment and connectivity (P0)

- [ ] Inject required env vars in deployment env: `JWT_SECRET`, `WX_APPID`, `WX_APP_SECRET`
- [x] One-command local verification script is available (`scripts/verify-deploy.sh`, `scripts/verify-deploy.ps1`)
- [x] Production env strong-validation script is available (`scripts/verify-prod-env.sh`, `scripts/verify-prod-env.ps1`)
- [x] `docker compose up -d` starts all services
- [x] `curl http://localhost/api/health` returns `status=ok`
- [x] `docker compose exec app node dist/scripts/seed.js` succeeds
- [x] `curl http://localhost/api/libraries` returns data

### 4.3 Submission artifacts and compliance (P0)

- [ ] WeChat backend request domain (HTTPS) configured
- [ ] Domain record + TLS certificate validity confirmed
- [ ] Mini-program category and privacy compliance checklist reviewed

---

## 5. Current Blockers and Actions

### Blockers

1. Required deployment env vars are not injected in real deployment environment.
2. Device-level regression evidence and bug ledger (iOS/Android) are not yet attached.

### Recommended action order

1. Inject production secrets in target environment:
   - `JWT_SECRET`
   - `WX_APPID`
   - `WX_APP_SECRET`
2. Run one-command verification in target environment:
   - Linux/macOS: `./scripts/verify-deploy.sh`
   - Windows PowerShell: `.\scripts\verify-deploy.ps1`
3. If script execution is restricted, run equivalent manual checks:
   - `docker compose config`
   - `docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .`
   - `docker compose up -d`
4. Verify runtime:
   - `curl http://localhost/api/health`
   - `docker compose exec app node dist/scripts/seed.js`
   - `curl http://localhost/api/libraries`
5. Complete iOS + Android manual regression and attach evidence (screenshots/video).
6. Fill bug ledger and close all `S0`/`S1` issues before submission gate review.

---

## 6. Gate Decision

Current status: **Code/build gate PASS, local deployment gate PASS, submission gate PENDING**.

Before submission, finish production env secret injection and attach device regression evidence.
