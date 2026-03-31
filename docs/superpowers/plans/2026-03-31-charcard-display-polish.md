# CharCard 字体与拼音区精修 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 放大学习卡片中的主汉字、把拼音区播放按钮调整为更活泼的糖豆风格，并将组词项整体缩小一号。

**Architecture:** 本轮只修改 `CharCard.vue` 一个文件，不动模板结构层级和业务逻辑。通过微调 `char-main`、`char-pinyin` / `speaker-button`、`word-item` 的尺寸、渐变、阴影和反馈，强化“汉字是主角”的首屏层级。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、SCSS、uni-app、wot-design、现有 `speakText` 工具

---

## File Structure

- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
  - 放大 `char-main`
  - 精修 `char-pinyin` 和 `speaker-button`
  - 缩小 `word-item`
- Verify: `docs/superpowers/specs/2026-03-31-charcard-display-polish-design.md`
  - 对照本轮视觉层级与交互目标

### Task 1: 放大主汉字并顺一下展示节奏

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确主汉字目标**

```ts
// CharCard.vue 主汉字目标状态（人工对照）
// 1. char-main 比当前更大
// 2. char-display 放大后仍保持居中稳定
// 3. 不改变现有动画和模板结构
```

- [ ] **Step 2: 检查当前主汉字尺寸仍是旧值**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['font-size: 210rpx;', 'margin-top: 42rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些当前值仍存在，说明主汉字还没放大。

- [ ] **Step 3: 调整主汉字与展示区样式**

将 `CharCard.vue` 中的 `.char-display` 和 `.char-main` 替换为：

```scss
.char-display {
  text-align: center;
  opacity: 0;
  transform: translateY(36rpx);
  transition: all 0.5s ease-out;
  margin-top: 38rpx;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.char-main {
  font-size: 232rpx;
  font-weight: bold;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: #2f2a24;
  line-height: 1;
  text-shadow: 0 8rpx 16rpx rgba(47, 42, 36, 0.08);
}
```

- [ ] **Step 4: 运行针对性检查确认主汉字已放大**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'char main enlarged': 'font-size: 232rpx;' in text,
  'char display margin tuned': 'margin-top: 38rpx;' in text,
  'char shadow updated': 'text-shadow: 0 8rpx 16rpx rgba(47, 42, 36, 0.08);' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交主汉字展示改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: enlarge learning character display"
```

### Task 2: 把拼音播放按钮改成糖豆风格

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确拼音区目标**

```ts
// char-pinyin 区目标状态（人工对照）
// 1. speaker-button 比当前更活泼
// 2. 仍保持按钮 + 拼音的横向结构
// 3. speakChar 行为不变
```

- [ ] **Step 2: 检查当前按钮仍是偏素的旧样式**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['width: 58rpx;', 'background: rgba(255, 255, 255, 0.92);', 'color: #8a6a41;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些当前值仍存在，说明按钮还没切到糖豆风格。

- [ ] **Step 3: 调整拼音区和播放按钮样式**

将 `CharCard.vue` 中的 `.char-pinyin` 和 `.speaker-button` 替换为：

```scss
.char-pinyin {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.speaker-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(247, 213, 153, 0.5);
  border-radius: 999rpx;
  background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);
  color: #d08a16;
  box-shadow:
    0 8rpx 16rpx rgba(232, 177, 68, 0.14),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
  transition: all 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.95);
    background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);
    box-shadow: 0 4rpx 10rpx rgba(232, 177, 68, 0.12);
  }
}
```

- [ ] **Step 4: 运行针对性检查确认按钮已切到糖豆风格**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'button enlarged': 'width: 72rpx;' in text and 'height: 72rpx;' in text,
  'candy gradient applied': 'background: linear-gradient(180deg, #fffaf1 0%, #ffefcf 100%);' in text,
  'warm button color applied': 'color: #d08a16;' in text,
  'active gradient feedback applied': 'background: linear-gradient(180deg, #fff1d9 0%, #ffe8bf 100%);' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交拼音区改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: polish learning pinyin speaker button"
```

### Task 3: 将组词项缩小一号

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`

- [ ] **Step 1: 写一个最小失败断言草稿，明确词组项缩小目标**

```ts
// word-item 目标状态（人工对照）
// 1. 组词项比当前更小一号
// 2. 多主题色和点击反馈保留
// 3. 文本仍清楚、可点范围仍足够
```

- [ ] **Step 2: 检查当前词组项仍是较大的旧尺寸**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = ['padding: 18rpx 34rpx;', 'border-radius: 56rpx;', 'font-size: 34rpx;']
for item in checks:
    print(item, 'FOUND' if item in text else 'MISSING')
PY`
Expected: 这些值仍存在，说明词组项还没缩小。

- [ ] **Step 3: 调整词组项尺寸和阴影强度**

将 `CharCard.vue` 中的 `.word-item` 替换为：

```scss
.word-item {
  padding: 14rpx 28rpx;
  border-radius: 46rpx;
  border: 2rpx solid transparent;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow:
    0 6rpx 12rpx rgba(214, 153, 41, 0.08),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.6);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 3rpx 8rpx rgba(214, 153, 41, 0.08);
  }
}
```

- [ ] **Step 4: 运行针对性检查确认词组项已缩小**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'smaller word padding': 'padding: 14rpx 28rpx;' in text,
  'smaller word radius': 'border-radius: 46rpx;' in text,
  'smaller word font': 'font-size: 30rpx;' in text,
  'lighter active shadow': 'box-shadow: 0 3rpx 8rpx rgba(214, 153, 41, 0.08);' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 5: 提交组词项缩小改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: refine learning word chip sizing"
```

### Task 4: 验证 CharCard 交互和展示未受影响

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
- Verify: `docs/superpowers/specs/2026-03-31-charcard-display-polish-design.md`

- [ ] **Step 1: 检查展示与交互结构仍符合预期**

Run: `python -X utf8 - <<'PY'
from pathlib import Path
p = Path('d:/MyDir/shizi/shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue')
text = p.read_text(encoding='utf-8')
checks = {
  'char display still present': 'class="char-display"' in text,
  'speaker click still present': '@click.stop="speakChar"' in text,
  'word playback still present': '@click="playWord(word)"' in text,
  'continue button still present': '@click="handleNext"' in text,
}
for name, ok in checks.items():
    print(name, 'PASS' if ok else 'FAIL')
PY`
Expected: 全部 `PASS`。

- [ ] **Step 2: 运行 lint 检查确认样式精修未引入问题**

Run: `cd /d/MyDir/shizi/shizi-frontend && npx eslint src/subpkg-learning/components/learn/CharCard.vue`
Expected: 退出码为 `0`，允许出现 editor 环境提示，但不能有 lint error。

- [ ] **Step 3: 按 spec 做人工验收**

```text
1. 主汉字比上一版明显更大。
2. 播放按钮风格更活泼，更接近当前页面里的糖豆按钮。
3. 拼音区域没有因为按钮放大而显挤。
4. 组词项整体缩小一号，但依旧清楚、好点。
5. 点击播放汉字、点击词组、点击继续都保持正常。
```

- [ ] **Step 4: 提交最终 CharCard 精修改动**

```bash
git add shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue
git commit -m "feat: polish learning character display"
```

## Self-Review

- Spec coverage: 已覆盖主汉字放大、拼音按钮糖豆化、组词项缩小以及交互保持不变这几项要求。
- Placeholder scan: 计划中没有 TBD/TODO 或“类似前一任务”这类占位内容，代码片段和命令都已写全。
- Type consistency: 全程仅围绕 `CharCard.vue` 现有类名和方法做微调，`speakChar`、`playWord`、`handleNext`、`char-main`、`speaker-button`、`word-item` 等命名前后一致。
