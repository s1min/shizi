# 学习详情页顶部导航微调 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改动学习页信息结构和交互逻辑的前提下，把顶部导航区微调得更软、更萌、更贴近低龄儿童识字产品气质。

**Architecture:** 这轮只改 `index.vue` 的顶部导航相关样式，不碰模板结构和脚本逻辑。通过调整顶部容器、返回按钮、标题、数字和进度条的 SCSS 参数，完成“泡泡糖按钮 + 果冻进度条”的视觉微调。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、SCSS、uni-app、wot-design 图标组件

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
  - 仅调整顶部 header 相关 SCSS
  - 微调顶部容器间距、返回按钮外观、标题视觉中心、数字层级、进度条厚度和配色
- Verify: `docs/superpowers/specs/2026-03-31-learn-header-micro-tuning-design.md`
  - 对照微调目标，确保没有偏离 spec

### Task 1: 软化顶部容器和按钮气质

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确顶部微调目标**

```ts
// index.vue 顶部微调目标（人工对照）
// 1. progress-header 更像柔和卡片而不是普通容器
// 2. exit-entry 更像泡泡糖按钮
// 3. step-title 仍是纯文字，但更稳地居中
```

- [ ] **Step 2: 检查当前顶部样式仍偏功能型**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = ['padding: 26rpx 32rpx 24rpx;', 'width: 76rpx;', 'height: 76rpx;', 'font-size: 30rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些现有样式都还存在，说明顶部尚未做这轮更软更萌的微调。

- [ ] **Step 3: 微调顶部容器样式**

在 `index.vue` 中把 `.progress-header` 替换为：

```scss
.progress-header {
  padding: 30rpx 32rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(255, 247, 234, 0.96));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow:
    0 16rpx 36rpx rgba(226, 172, 70, 0.12),
    inset 0 -2rpx 0 rgba(255, 255, 255, 0.55);
}
```

- [ ] **Step 4: 微调顶部按钮和标题样式**

在 `index.vue` 中把 `.progress-topline`、`.step-title`、`.exit-entry` 替换为：

```scss
.progress-topline {
  display: grid;
  grid-template-columns: 96rpx 1fr auto;
  align-items: center;
  gap: 18rpx;
}

.step-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #6a5034;
  letter-spacing: 2rpx;
  transform: translateY(-2rpx);
}

.exit-entry {
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(247, 213, 153, 0.5);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 10rpx 20rpx rgba(232, 177, 68, 0.16),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.78);
  transition: all 0.2s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
    background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);
    box-shadow: 0 6rpx 12rpx rgba(232, 177, 68, 0.14);
  }
}
```

- [ ] **Step 5: 运行针对性检查确认顶部已软化**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'softer header gradient': 'rgba(255, 252, 246, 0.98)' in text,
  'larger button size': 'width: 84rpx;' in text and 'height: 84rpx;' in text,
  'bubble shadow': '0 10rpx 20rpx rgba(232, 177, 68, 0.16)' in text,
  'title slightly lifted': 'transform: translateY(-2rpx);' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 6: 提交顶部气质微调改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: soften learning header visuals"
```

### Task 2: 把进度条调成更圆润的果冻条

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确进度条目标**

```ts
// progress bar 目标状态（人工对照）
// 1. progress-bg 比现在更厚、更圆
// 2. progress-fill 颜色更奶、更柔和
// 3. progress-text 仍是纯数字，但气质更轻一点
```

- [ ] **Step 2: 检查当前进度条还是细条样式**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = ['height: 14rpx;', 'background: rgba(245, 166, 35, 0.18);', 'font-size: 28rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些旧样式都仍然存在，说明进度条还没变成果冻条。

- [ ] **Step 3: 调整进度条和数字样式**

在 `index.vue` 中把 `.progress-row`、`.progress-bg`、`.progress-fill`、`.progress-text`、`.progress-caption` 替换为：

```scss
.progress-row {
  display: flex;
  align-items: center;
}

.progress-bg {
  flex: 1;
  min-width: 0;
  height: 18rpx;
  background: linear-gradient(180deg, rgba(255, 243, 220, 0.95), rgba(255, 238, 205, 0.98));
  border-radius: 999rpx;
  overflow: hidden;
  box-shadow:
    inset 0 2rpx 4rpx rgba(214, 170, 88, 0.08),
    inset 0 -1rpx 0 rgba(255, 255, 255, 0.55);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd977 0%, #f9bf45 56%, #f1a62a 100%);
  border-radius: 999rpx;
  box-shadow:
    inset 0 2rpx 0 rgba(255, 248, 220, 0.6),
    0 4rpx 10rpx rgba(240, 168, 46, 0.2);
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 82rpx;
  text-align: right;
  font-size: 28rpx;
  font-weight: 700;
  color: #8b7357;
}

.progress-caption {
  font-size: 24rpx;
  color: #a28d72;
  line-height: 1.2;
  padding-left: 2rpx;
}
```

- [ ] **Step 4: 运行针对性检查确认进度条变厚变柔和**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'thicker track': 'height: 18rpx;' in text,
  'milky track gradient': 'rgba(255, 243, 220, 0.95)' in text,
  'jelly fill gradient': 'background: linear-gradient(90deg, #ffd977 0%, #f9bf45 56%, #f1a62a 100%);' in text,
  'softer progress text': 'color: #8b7357;' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交进度条微调改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: refine learning header progress bar"
```

### Task 3: 验证顶部微调未影响结构与行为

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Verify: `docs/superpowers/specs/2026-03-31-learn-header-micro-tuning-design.md`

- [ ] **Step 1: 检查模板结构没有被改坏**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/learn/index.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'wd-icon still present': '<wd-icon name="arrow-left" size="22px" />' in text,
  'step title still present': '<div class="step-title">' in text,
  'plain progress text still present': '{{ currentCharIndex }}/{{ totalChars }}' in text,
  'progress caption still present': '{{ charProgressLabel }}' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 2: 运行 lint 检查确认样式改动未引入问题**

Run: `cd /d/MyDir/shizi/shizi-frontend && npx eslint src/subpkg-learning/learn/index.vue`
Expected: 退出码为 `0`，允许出现 editor 环境提示，但不能有 lint error。

- [ ] **Step 3: 按 spec 做人工验收**

```text
1. 顶部布局仍是左按钮、中标题、右数字、下方进度条。
2. 返回按钮比之前更饱满、更像泡泡糖按钮。
3. 标题仍是纯文字，没有新增底牌。
4. 右侧数字仍然是纯数字，没有徽章底。
5. 进度条明显比之前更厚、更圆、更柔和。
6. 点击返回按钮仍能触发退出确认。
```

- [ ] **Step 4: 提交最终微调改动**

```bash
git add shizi-frontend/src/subpkg-learning/learn/index.vue
git commit -m "feat: polish learning header micro interactions"
```

## Self-Review

- Spec coverage: 已覆盖顶部容器软化、返回按钮泡泡糖感、标题视觉中心、纯数字保留、果冻进度条和结构不变这几项要求。
- Placeholder scan: 计划内没有使用 TBD/TODO/“自行处理”等占位表达，命令、文件和样式片段都已写全。
- Type consistency: 全程只调整 `index.vue` 的现有类名和模板结构，没有引入新的不一致命名。
