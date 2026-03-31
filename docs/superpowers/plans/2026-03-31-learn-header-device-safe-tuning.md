# 学习详情页顶部真机风险预防型微调 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改动学习页顶部结构和逻辑的前提下，对顶部导航进行真机风险预防型微调，让按钮热区、标题视觉居中、进度条层次和整体间距在小程序/真机上更稳。

**Architecture:** 这轮只修改 `index.vue` 顶部 header 的 SCSS，不动模板和脚本。通过微调 grid 列宽、按钮外部留白、进度条阴影强度以及容器垂直节奏，降低不同机型上的视觉偏移和发灰风险。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、SCSS、uni-app、wot-design 图标组件

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - 微调顶部 header 的 grid 列宽和间距
  - 稳定返回按钮热区与对齐
  - 收敛进度条阴影与高光
  - 顺一下顶部容器内部呼吸感
- Verify: `docs/superpowers/specs/2026-03-31-learn-header-device-safe-tuning-design.md`
  - 对照本轮“真机风险预防型微调”目标

### Task 1: 稳定返回按钮热区和标题视觉居中

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确本轮布局目标**

```ts
// index.vue 顶部稳定性目标（人工对照）
// 1. 返回按钮保持现有视觉体积，但布局更稳
// 2. step-title 在不同数字宽度下更接近视觉居中
// 3. 不改模板结构，不新增元素
```

- [ ] **Step 2: 检查当前顶部仍存在真机风险点**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = ['grid-template-columns: 96rpx 1fr auto;', 'gap: 18rpx;', 'width: 84rpx;', 'height: 84rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些当前值仍然存在，说明还没有针对真机稳定性做进一步修正。

- [ ] **Step 3: 微调 grid 列宽和顶部节奏，让标题更稳地居中**

在 `index.vue` 中把 `.progress-header`、`.progress-topline`、`.step-title` 替换为：

```scss
.progress-header {
  padding: 30rpx 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(255, 247, 234, 0.96));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow:
    0 14rpx 28rpx rgba(226, 172, 70, 0.1),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.5);
}

.progress-topline {
  display: grid;
  grid-template-columns: 96rpx 1fr 96rpx;
  align-items: center;
  gap: 12rpx;
}

.step-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
}
```

- [ ] **Step 4: 微调按钮热区稳定性，但不继续放大视觉体积**

在 `index.vue` 中把 `.exit-entry` 和 `.progress-text` 替换为：

```scss
.exit-entry {
  width: 84rpx;
  height: 84rpx;
  justify-self: start;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(247, 213, 153, 0.46);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
  transition: all 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.97);
    background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);
    box-shadow: 0 4rpx 10rpx rgba(232, 177, 68, 0.12);
  }
}

.progress-text {
  min-width: 96rpx;
  justify-self: end;
  text-align: right;
  font-size: 28rpx;
  font-weight: 700;
  color: #8b7357;
}
```

- [ ] **Step 5: 运行针对性检查确认布局更稳**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'balanced columns': 'grid-template-columns: 96rpx 1fr 96rpx;' in text,
  'tighter grid gap': 'gap: 12rpx;' in text,
  'button left aligned': 'justify-self: start;' in text,
  'progress text reserved width': 'min-width: 96rpx;' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交布局稳定性微调改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: stabilize learning header alignment"
```

### Task 2: 收敛进度条阴影和顶部呼吸感

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确层次修正目标**

```ts
// progress 区域目标状态（人工对照）
// 1. 保留果冻条方向，但阴影和高光更克制
// 2. 顶部 header 内部上下节奏更自然
// 3. 不影响现有进度条可读性
```

- [ ] **Step 2: 检查当前进度条仍有较强浮感**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = ['0 4rpx 10rpx rgba(240, 168, 46, 0.2);', 'inset 0 2rpx 0 rgba(255, 248, 220, 0.6)', 'padding: 30rpx 32rpx 24rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 当前这些层次值仍存在，说明还没收成真机更稳的状态。

- [ ] **Step 3: 微调进度条轨道、填充和 caption 的层次**

在 `index.vue` 中把 `.progress-bg`、`.progress-fill`、`.progress-caption` 替换为：

```scss
.progress-bg {
  flex: 1;
  min-width: 0;
  height: 18rpx;
  background: linear-gradient(180deg, rgba(255, 243, 220, 0.94), rgba(255, 238, 205, 0.96));
  border-radius: 999rpx;
  overflow: hidden;
  box-shadow:
    inset 0 1rpx 3rpx rgba(214, 170, 88, 0.07),
    inset 0 -1rpx 0 rgba(255, 255, 255, 0.45);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd977 0%, #f9bf45 56%, #f1a62a 100%);
  border-radius: 999rpx;
  box-shadow:
    inset 0 1rpx 0 rgba(255, 248, 220, 0.45),
    0 2rpx 6rpx rgba(240, 168, 46, 0.14);
  transition: width 0.3s ease;
}

.progress-caption {
  font-size: 24rpx;
  color: #a79278;
  line-height: 1.2;
  padding-left: 2rpx;
}
```

- [ ] **Step 4: 运行针对性检查确认进度条更克制**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'lighter track shadow': 'inset 0 1rpx 3rpx rgba(214, 170, 88, 0.07)' in text,
  'lighter fill shadow': '0 2rpx 6rpx rgba(240, 168, 46, 0.14)' in text,
  'lighter fill highlight': 'inset 0 1rpx 0 rgba(255, 248, 220, 0.45)' in text,
  'caption softened': 'color: #a79278;' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交层次收敛改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: tune learning header depth for devices"
```

### Task 3: 验证结构与行为不受影响

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Verify: `docs/superpowers/specs/2026-03-31-learn-header-device-safe-tuning-design.md`

- [ ] **Step 1: 检查模板结构保持不变**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'wd-icon still present': '<wd-icon name="arrow-left" size="22px" />' in text,
  'step title still present': '<div class="step-title">' in text,
  'progress text binding still present': '{{ currentCharIndex }}/{{ totalChars }}' in text,
  'progress row still present': '<div class="progress-row">' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 2: 运行 lint 检查确认样式调整未引入问题**

Run: `cd /d/MyDir/shizi/shizi-frontend && npx eslint src/subpkg-learning/learn/index.vue`
Expected: 退出码为 `0`，允许出现 editor 环境提示，但不能有 lint error。

- [ ] **Step 3: 按 spec 做人工验收**

```text
1. 顶部仍是左按钮、中标题、右数字、下方进度条。
2. 返回按钮没有继续变大，但点击感更稳。
3. 标题在 2/7、10/28 这类数字长度下尽量保持视觉居中。
4. 进度条仍是果冻条方向，但比上一版更克制、不发灰。
5. 顶部整体更顺眼，不显挤、不显脏。
```

- [ ] **Step 4: 提交最终真机风险预防型微调改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: polish learning header for device rendering"
```

## Self-Review

- Spec coverage: 已覆盖按钮热区稳定、标题视觉居中、进度条层次收敛、顶部呼吸感调整、结构不变这几项要求。
- Placeholder scan: 没有使用 TBD/TODO/“后续处理”等占位语句，命令、文件和样式片段都已明确。
- Type consistency: 全程仅围绕 `index.vue` 现有类名做样式微调，没有引入新的命名漂移或结构变更。
