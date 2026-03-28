# GitHub Issues 工作流（个人开发版）

> 适用仓库：`s1min/shizi`  
> 更新日期：2026-03-28

---

## 1. 目标

把缺陷记录从“本地手工维护”为主，切换为“GitHub Issues 为主 + 本地自动同步”为主。

你在 GitHub 提单，我读取同步后的 JSON，直接按优先级修复。

---

## 2. 一次性准备

1. 在仓库启用 Issues（GitHub 仓库 Settings -> Features -> Issues）。
2. 本仓库已提供 Bug 模板：
   - `.github/ISSUE_TEMPLATE/bug.yml`
3. 准备一个 GitHub Token（建议最小权限）：
   - 只同步 issues：`Issues: Read`
   - 初始化标签：`Issues: Read and Write`

将 token 放到当前 shell 环境：

```powershell
$env:GITHUB_TOKEN = "<your_token>"
```

---

## 3. 初始化标签（可重复执行）

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-github-labels.ps1
```

默认会根据 `origin` 自动识别仓库（当前是 `s1min/shizi`）。

如需显式指定：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-github-labels.ps1 -Repo s1min/shizi
```

---

## 4. 同步 Open Bugs 到本地

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-github-issues.ps1
```

默认行为：

1. 读取 `origin` 解析仓库名。
2. 拉取 `state=open` 且 `label=bug` 的 issues。
3. 自动排除 Pull Request。
4. 输出到：
   `docs/bug_reports/github_issues_open.json`

常用参数：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-github-issues.ps1 -Label "bug,S0" -OutputPath docs/bug_reports/github_issues_s0.json
```

---

## 5. 推荐日常节奏

1. 你在 GitHub 建立 Bug（使用模板）。
2. 我执行 `sync-github-issues.ps1` 拉取最新问题。
3. 我按 `S0 -> S1 -> S2` 顺序修复并回填状态。
4. 修复后将 issue 打上 `fixed-await-regression`。
5. 你实机回归通过后关闭 issue。

---

## 6. 与现有文档的关系

1. GitHub Issues：主缺陷源。
2. `docs/bug_reports/session_YYYY-MM-DD.md`：本地测试过程补充记录（可选）。
3. `docs/device_regression_evidence.md`：提审证据，保留 Bug ID 引用。
