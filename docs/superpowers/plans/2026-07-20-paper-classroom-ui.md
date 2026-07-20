# Paper Classroom UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** 将趣字宝前端统一迁移到 `Paper Classroom / 纸张学习册` 视觉系统，并按 3-4 岁、5-6 岁、7-8 岁的使用模式实现家长启动、孩子接管的核心交互。

**Architecture:** 先建立可复用的颜色、字体、间距、卡片、按钮、状态和页面壳层，再逐页迁移现有 uni-app 页面。年龄模式和家长验证作为独立的 UI 状态层，页面通过 `ageGroup`、`taskState` 和 `characterStatus` 接收已归一化状态，不直接在模板中猜测 store 内部数据。学习页面、复习页面和结算页隐藏 TabBar；首页、图鉴和我的继续使用现有路由，但重整职责和视觉层级。

**Tech Stack:** uni-app、Vue 3、TypeScript、Pinia、SCSS、Wot Design Uni、现有自定义 TabBar、现有 HanziWriter/Canvas 描红实现。

---

## Scope And Baseline

本计划只覆盖前端 UI、交互状态和页面信息架构，不在本轮实现后端学习算法、ASR 评分、AI 造句、多儿童档案或新的商业化能力。

必须遵守：

- 保留现有学习数据和路由入口，避免视觉迁移破坏进度恢复；
- 不把未实现的后端接口伪装成已可用能力；
- `early`、`preschool`、`school` 只控制呈现和默认流程，不修改掌握算法；
- 所有页面使用 Paper Classroom 语义令牌，不在页面组件中新增紫色、冷灰整屏、Emoji 正式图标或独立阴影体系；
- 现有未跟踪文件和与本计划无关的修改不得回滚。

## File Map

| 文件 | 职责 |
|---|---|
| `shizi-frontend/src/style/tokens.scss` | Paper Classroom 颜色、字体、字号、间距、圆角、阴影和动效令牌 |
| `shizi-frontend/src/style/paper-theme.scss` | 页面背景、纸纹、书签、田字格和公共布局 |
| `shizi-frontend/src/style/components.scss` | PaperButton、PaperCard、状态标签、进度和 TabBar 公共样式 |
| `shizi-frontend/src/style/index.scss` | 统一导入入口，保留现有学习测验公共样式并清理重复测试样式 |
| `shizi-frontend/src/types/ui.ts` | `AgeGroup`、`CharacterStatus`、`TaskState`、`UiMode` 等 UI 类型 |
| `shizi-frontend/src/utils/ui-mode.ts` | 年龄模式归一化、任务状态和汉字状态到视觉变体的纯函数 |
| `shizi-frontend/src/components/ui/PaperPage.vue` | 统一页面背景和安全区壳层 |
| `shizi-frontend/src/components/ui/PaperButton.vue` | 主按钮、次按钮、复习、成功、危险和 Ghost 变体 |
| `shizi-frontend/src/components/ui/PaperCard.vue` | 纸张卡片和书签色条 |
| `shizi-frontend/src/components/ui/PaperStatusBadge.vue` | 已掌握、待巩固、复习、离线等文字+图标状态 |
| `shizi-frontend/src/components/ui/PaperProgress.vue` | 任务、步骤和图鉴进度条 |
| `shizi-frontend/src/components/ui/ParentGate.vue` | 算术题/长按家长验证容器 |
| `shizi-frontend/src/components/ui/AudioPrompt.vue` | 音频播放按钮、加载、失败和文字兜底 |
| `shizi-frontend/src/store/ui.ts` | 年龄模式、家长态有效期和 reduced-motion/音频偏好 |
| `shizi-frontend/src/tabbar/config.ts` | 今日/图鉴/我的三项导航配置 |
| `shizi-frontend/src/tabbar/TabbarItem.vue` | 统一 SVG/UnoCSS 图标、标签和 active 书签条 |
| `shizi-frontend/src/pages/login/index.vue` | 家长信任向登录页 |
| `shizi-frontend/src/pages/onboarding/index.vue` | 年龄、字库、每日计划三步引导 |
| `shizi-frontend/src/pages/home/index.vue` | 单一主入口的今日学习册首页 |
| `shizi-frontend/src/pages/loot/index.vue` | 已掌握/已接触/待巩固图鉴 |
| `shizi-frontend/src/pages/me/index.vue` | 家长验证分流和家长中心 |
| `shizi-frontend/src/pages/parent-report/index.vue` | 家长今日学习报告 |
| `shizi-frontend/src/pages/unit-list/index.vue` | 从 Tab 移到家长中心后的单元管理 |
| `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue` | 儿童学习页统一页眉和步骤节点 |
| `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue` | 字源动画纸卡 |
| `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue` | 听音三选一和年龄差异题面 |
| `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue` | 田字格、笔顺和年龄差异按钮 |
| `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue` | 单题测验状态和反馈 |
| `shizi-frontend/src/subpkg-learning/learn/index.vue` | 隐藏 Tab 的学习流程壳层、恢复和退出 |
| `shizi-frontend/src/subpkg-learning/learn/unit-test.vue` | 单元测试进度、退出和待巩固结果 |
| `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue` | 儿童结果页和家长报告入口 |
| `shizi-frontend/src/subpkg-learning/review/index.vue` | 天空蓝复习闪卡 |
| `shizi-frontend/src/components/ui/UiEmptyState.vue` | 空、离线、同步失败和音频失败状态 |
| `shizi-frontend/src/components/ui/UiIcon.vue` | 统一 SVG 图标包装，替代正式 UI 中的 Emoji |

---

### Task 1: Establish Paper Classroom Tokens

**Files:**
- Create: `shizi-frontend/src/style/tokens.scss`
- Create: `shizi-frontend/src/style/paper-theme.scss`
- Create: `shizi-frontend/src/style/components.scss`
- Modify: `shizi-frontend/src/style/index.scss`
- Modify: `shizi-frontend/src/uni.scss`

- [ ] **Step 1: Add semantic SCSS tokens**

Create `tokens.scss` with the exact semantic variables from `design/product_ui_design_v3.1.md`: `$paper`, `$paper-deep`, `$surface`, `$ink`, `$ink-muted`, `$apricot`, `$sky`, `$mint`, `$coral`, `$line`, spacing scale, radius scale, shadow scale and motion scale. Keep the existing uni-app variables as aliases where third-party Wot components depend on them.

- [ ] **Step 2: Add shared paper primitives**

Create `paper-theme.scss` with `.paper-page`, `.paper-safe-bottom`, `.paper-bookmark`, `.paper-section-title`, `.paper-grid` and safe-area helpers. The background uses CSS radial dots at opacity no higher than `0.06`; no image texture is required.

- [ ] **Step 3: Add shared component classes**

Create `components.scss` with `.paper-card`, `.paper-card--interactive`, `.paper-button`, `.paper-button--primary`, `.paper-button--secondary`, `.paper-button--review`, `.paper-button--success`, `.paper-button--danger`, `.paper-button--ghost`, `.paper-status-badge`, `.paper-progress` and `.paper-skeleton`. Every interactive class must include `touch-action: manipulation`, press feedback and disabled state.

- [ ] **Step 4: Wire the global entry and preserve learning styles**

Update `style/index.scss` to import `tokens.scss`, `paper-theme.scss` and `components.scss` before the existing shared quiz styles. Remove duplicated `.test` demo rules from `index.scss`. Update `uni.scss` to point primary, secondary, background, text and success values at the Paper Classroom aliases without changing unrelated Wot dimensions.

- [ ] **Step 5: Verify token compilation**

Run:

```powershell
pnpm -C shizi-frontend lint src/style/index.scss src/style/tokens.scss src/style/paper-theme.scss src/style/components.scss
pnpm -C shizi-frontend type-check
```

Expected: lint completes without new style errors; type-check reaches the existing project baseline or passes if the current type dependency issue has already been resolved.

- [ ] **Step 6: Commit the foundation**

```powershell
git add shizi-frontend/src/style/tokens.scss shizi-frontend/src/style/paper-theme.scss shizi-frontend/src/style/components.scss shizi-frontend/src/style/index.scss shizi-frontend/src/uni.scss
git commit -m "feat(ui): add paper classroom design tokens"
```

### Task 2: Add UI State Types, Age Modes, and Parent Gate

**Files:**
- Create: `shizi-frontend/src/types/ui.ts`
- Create: `shizi-frontend/src/utils/ui-mode.ts`
- Create: `shizi-frontend/src/store/ui.ts`
- Create: `shizi-frontend/src/components/ui/ParentGate.vue`
- Create: `shizi-frontend/src/components/ui/UiIcon.vue`
- Create: `shizi-frontend/src/components/ui/AudioPrompt.vue`
- Modify: `shizi-frontend/src/store/index.ts`
- Modify: `shizi-frontend/src/typings.ts`

- [ ] **Step 1: Define UI state types**

Add these exact types:

```ts
export type AgeGroup = 'early' | 'preschool' | 'school'
export type CharacterStatus = 'unseen' | 'exposed' | 'emerging' | 'needs_review' | 'mastered' | 'stable'
export type TaskState = 'first' | 'resume' | 'review' | 'new' | 'complete' | 'offline'
export type ParentGateReason = 'settings' | 'report' | 'library' | 'privacy' | 'account'

export interface UiMode {
  ageGroup: AgeGroup
  showTaskDetails: boolean
  showPinyin: boolean
  useImageOptions: boolean
  allowTraceSkip: boolean
  useVoicePrompt: boolean
}
```

- [ ] **Step 2: Implement pure mode helpers**

Implement `getUiMode(ageGroup)`, `normalizeAgeGroup(value)`, `getCharacterStatus(record)` and `getTaskState(storeSnapshot)`. `early` returns image options, voice prompts and trace skip; `preschool` returns limited task text and optional pinyin; `school` returns full task text and pinyin. These functions must not mutate Pinia state.

- [ ] **Step 3: Add persisted UI store**

Create a Pinia store with `ageGroup`, `parentModeExpiresAt`, `audioEnabled` and `reducedMotion`. Add `enterParentMode()` for a 10-minute session, `leaveParentMode()`, `isParentMode` and `setAgeGroup()`. Persist only non-sensitive preferences; do not persist arithmetic answers or raw child data.

- [ ] **Step 4: Implement ParentGate**

`ParentGate.vue` receives `reason` and emits `verified`/`cancel`. Use a new random single-digit addition question per open. The full button container is at least 88rpx high. On success call `uiStore.enterParentMode()` and emit `verified`; on failure show an inline retry message. Do not block the current learning flow with the component.

- [ ] **Step 5: Implement shared audio and icon wrappers**

`UiIcon.vue` accepts a constrained icon name union and size/color props; use the existing Carbon/UnoCSS icon system or inline SVG, never Emoji. `AudioPrompt.vue` accepts `src`, `label`, `fallbackText` and `autoPlay`; render loading, playing, failed and text fallback states with an 88rpx touch target.

- [ ] **Step 6: Add focused unit tests for pure helpers**

If no frontend test runner exists, create a lightweight executable test file under `shizi-frontend/src/utils/__tests__/ui-mode.test.ts` using the project’s available test setup; otherwise test by importing the functions through the existing runner. Cover all three age modes, unknown age fallback to `preschool`, mastered status and task-state precedence (`offline` > `resume` > `review` > `new` > `complete`).

- [ ] **Step 7: Verify**

```powershell
pnpm -C shizi-frontend type-check
pnpm -C shizi-frontend lint
```

Expected: new UI types and components compile without introducing `any` casts in the shared state layer.

### Task 3: Unify Navigation and Page Shells

**Files:**
- Modify: `shizi-frontend/src/tabbar/config.ts`
- Modify: `shizi-frontend/src/tabbar/TabbarItem.vue`
- Modify: `shizi-frontend/src/tabbar/store.ts`
- Modify: `shizi-frontend/src/layouts/default.vue`
- Create: `shizi-frontend/src/components/ui/PaperPage.vue`
- Modify: `shizi-frontend/src/components/navigation/SecondaryPageNavbar.vue`

- [ ] **Step 1: Change the top-level tab list**

Set both `nativeTabbarList` and `customTabbarList` to `今日 -> pages/home/index`, `图鉴 -> pages/loot/index`, `我的 -> pages/me/index`. Use the existing Carbon icons `home`, `book`, and `user`; active color is `$apricot`, inactive color is `$ink-muted`.

- [ ] **Step 2: Add active bookmark indicator**

Update `TabbarItem.vue` so each item has a stable 88rpx touch container, visible text, icon, and a 16rpx active bookmark bar. Do not use emoji or icon-only labels. Keep badge support but use `$coral` plus a text count/dot.

- [ ] **Step 3: Add PaperPage**

`PaperPage.vue` accepts `class`, `hideTabbar`, `safeBottom` and `ageGroup`. It renders a `.paper-page` root with `env(safe-area-inset-top)` and bottom padding. `hideTabbar` must call the existing tabbar hide/show mechanism rather than relying only on CSS.

- [ ] **Step 4: Align secondary navbar**

Update `SecondaryPageNavbar.vue` to use `$paper`, `$ink`, `$line` and an 88rpx close/back hit area. Keep its current fallback URL behavior. It is for parent/legal pages only; learning pages continue to use `LearnFlowHeader`.

- [ ] **Step 5: Verify navigation paths**

Run:

```powershell
pnpm -C shizi-frontend build:h5
pnpm -C shizi-frontend build:mp
```

Expected: H5 and MP builds contain home, loot and me routes, and learning subpackage pages still build with hidden TabBar behavior.

### Task 4: Redesign Login, Onboarding, and Parent Handoff

**Files:**
- Modify: `shizi-frontend/src/pages/login/index.vue`
- Modify: `shizi-frontend/src/pages/onboarding/index.vue`
- Modify: `shizi-frontend/src/pages/privacy/index.vue`
- Modify: `shizi-frontend/src/pages/agreement/index.vue`

- [ ] **Step 1: Rebuild login hierarchy**

Use `PaperPage`, a learning-book illustration slot, one微信登录 primary button, one本地体验 ghost button and visible privacy summary. Remove Emoji from formal UI; use `UiIcon` or approved SVG assets. Keep existing login API and redirect behavior.

- [ ] **Step 2: Implement the three-step onboarding state**

Replace the current single library selection with local step state: `age -> library -> dailyPlan`. The age step writes `uiStore.ageGroup`; library and daily count write existing learn store fields. Each step has one primary CTA and a visible back action. Preserve the existing switch-to-home behavior after completion.

- [ ] **Step 3: Add age-specific recommendation copy**

Use the exact age cards from the design document. If `lib_preschool` is unavailable, mark it disabled with `即将上线` and explicitly explain that only the available library can be selected; do not allow a dead selection.

- [ ] **Step 4: Add handoff completion state**

After plan confirmation show `设置完成，把手机交给孩子吧` and the CTA `进入今天的学习`. Do not count this handoff page as learning time.

- [ ] **Step 5: Make legal pages parent-readable**

Use `PaperPage` and `SecondaryPageNavbar`, 28rpx body text, 1.75 line height, clear section headings, and separate destructive data deletion content. Do not add child-oriented animation to legal pages.

- [ ] **Step 6: Verify onboarding**

Manually test: new local user, new logged-in user, back navigation on each step, unavailable library, and interrupted onboarding. Run `pnpm -C shizi-frontend type-check`.

### Task 5: Redesign Today Home for Parent-Start/Child-Handoff

**Files:**
- Modify: `shizi-frontend/src/pages/home/index.vue`
- Modify: `shizi-frontend/src/store/learn.ts`
- Create: `shizi-frontend/src/components/ui/TodayTaskCard.vue`
- Create: `shizi-frontend/src/components/ui/OfflineNotice.vue`

- [ ] **Step 1: Normalize the task state in the page**

Derive `taskState` through `getTaskState()` and expose only one primary action. Priority is: offline notice, resume current learning, due review, new learning, complete. Keep the existing review and unit data sources; do not create a second task scheduler in the page.

- [ ] **Step 2: Build TodayTaskCard**

Render the Paper Classroom main card with bookmark strip, `今天学什么？`, age-specific summary, optional audio prompt and `开始今天的学习`. In `early`/`preschool`, hide the separate review/new buttons and navigate directly to the correct flow; in `school`, allow an expandable task detail row without adding another primary CTA.

- [ ] **Step 3: Add resume and offline states**

Show `继续学习` with the last step label when `learnStore` has an in-progress pointer. Show `OfflineNotice` when sync failed or local-only mode is active; allow learning to continue and show retry only in parent mode.

- [ ] **Step 4: Remove emoji and game-map hierarchy**

Replace the current emoji icons and island-card-first structure with the task card, two compact secondary cards (`待复习`, `继续学习`) and facts (`已掌握`, `学习天`). Keep unit details available below the fold or through parent unit management.

- [ ] **Step 5: Wire parent gate entry**

The top-right lock opens `ParentGate` with reason `settings`; it must not expose library switching directly from the child home page. Keep the existing library picker only inside verified parent state.

- [ ] **Step 6: Verify home states**

Test first-use, due-review, resume, complete, no-review and offline states at 375px, 390px and 414px. Confirm the main CTA remains the only primary button and `pnpm -C shizi-frontend build:h5` succeeds.

### Task 6: Migrate Learning Flow Components

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/learn/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/CharCard.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/SpeakPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/QuizCard.vue`
- Create: `shizi-frontend/src/subpkg-learning/components/learn/ChildInstruction.vue`

- [ ] **Step 1: Add age mode to the learning shell**

Read `uiStore.ageGroup` and pass the derived `UiMode` to all four step components. Keep current step restoration and `learnStore.updateUnitProgress()` behavior. Do not expose TabBar while `learn/index.vue` is active.

- [ ] **Step 2: Rebuild LearnFlowHeader**

Use a stable custom header: 88rpx close hit area, centered step label, current character index, progress bar and four labeled nodes. Nodes completed/current/locked must use icon + label, not color alone. Closing opens the existing confirmation modal and preserves current progress.

- [ ] **Step 3: Add ChildInstruction**

Create a small instruction block with optional `AudioPrompt`, one short text line and an icon. In `early`, audio is primary and text is secondary; in `school`, text is primary and audio is optional.

- [ ] **Step 4: Update CharCard**

Use paper card background, target Hanzi typography, one-line explanation, `再看一遍`, `播放讲解` and the single primary `我看懂了`. Do not auto-advance after animation. Remove formal Emoji decorations; use approved SVG or content assets.

- [ ] **Step 5: Update SpeakPractice**

Implement three large answer cards and audio-first instruction. Use image options for `early`, image + Hanzi for `preschool`, and Hanzi/pinyin options for `school`. Preserve retry behavior and call existing `next`/`prev` events. Distinguish correct/wrong with icon, text and semantic color.

- [ ] **Step 6: Update TracingPractice**

Use paper grid tokens, sky-blue demonstration, apricot trace, neutral clear action and primary completion. Show `可以跳过` for `early`; keep the existing HanziWriter/Canvas fallback. Completion text must say `完成书写练习`, not `写对了` or `学会了`.

- [ ] **Step 7: Update QuizCard**

Keep the existing supported question types, but make the MVP visual treatment single-question and low-stimulation. Use inline option feedback, a visible `继续` action after feedback and no full-screen red error. Pass age mode to select image/pinyin presentation.

- [ ] **Step 8: Update completion copy and state semantics**

Change the per-character completion screen to `这个字我们见过了` or the age-appropriate equivalent; do not mark a character as stable mastered solely from this screen. Keep the existing store calls and record `needs_review` when the quiz is wrong.

- [ ] **Step 9: Verify learning flow**

Run a real-device or H5 flow for all three age modes: origin -> speak -> trace/skip -> quiz -> next character -> unit complete. Verify close confirmation, resume pointer, audio failure fallback, and no TabBar during learning.

### Task 7: Migrate Review, Unit Test, and Completion Pages

**Files:**
- Modify: `shizi-frontend/src/subpkg-learning/review/index.vue`
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-test.vue`
- Modify: `shizi-frontend/src/subpkg-learning/learn/unit-complete.vue`
- Modify: `shizi-frontend/src/pages/unit-list/index.vue`
- Modify: `shizi-frontend/src/pages/unit-list/components/UnitTaskCard.vue`
- Modify: `shizi-frontend/src/pages/unit-list/components/StatusLegendBar.vue`

- [ ] **Step 1: Apply sky review theme without creating a second design system**

Use `$sky-soft`, `$sky-dark`, paper cards and the shared button classes. Remove purple gradients and Emoji completion icons. Keep `today`, `unit` and `wrong` query scopes.

- [ ] **Step 2: Implement flashcard interaction states**

The card front shows Hanzi/image without pinyin; tap flips to pinyin, words and audio. Bottom buttons `不认识` and `认识` are always visible after flip, each at least 240rpx wide. Swipe is optional enhancement only. Preserve `learnStore.reviewChar()` and existing completion navigation.

- [ ] **Step 3: Update review empty and finish states**

Use `UiEmptyState` for no due review and a paper completion record for finish. Do not append another task automatically. Show exact counts and a parent-only report action where appropriate.

- [ ] **Step 4: Update unit test page**

Use one question per screen, `还剩 X 题`, a progress bar, inline answer feedback, `稍后再做`, and an explicit result handoff. Keep current question generation and star calculation unless a separate product rule change is approved.

- [ ] **Step 5: Update unit completion page**

Make `结束学习` the primary CTA; `复习待巩固字` is secondary; parent report is protected. Display touched count, immediate accuracy, needs-review count, duration and next review time. Preserve Canvas poster only as a secondary share action, not the visual hero.

- [ ] **Step 6: Move unit list out of top-level navigation**

Keep `pages/unit-list/index.vue` as a parent management page. Add parent-gate entry from `me` and use paper parent cards, not child island/game cards. Preserve unit review and wrong-character actions.

- [ ] **Step 7: Verify review and test paths**

Test today review, unit review, wrong-character review, empty review, interrupted unit test and completed unit. Run `pnpm -C shizi-frontend build:h5` and confirm subpackage output remains present.

### Task 8: Redesign Character Atlas and Parent Center

**Files:**
- Modify: `shizi-frontend/src/pages/loot/index.vue`
- Modify: `shizi-frontend/src/pages/me/index.vue`
- Create: `shizi-frontend/src/pages/parent-report/index.vue`
- Modify: `shizi-frontend/src/pages/privacy/index.vue`
- Modify: `shizi-frontend/src/pages/agreement/index.vue`
- Modify: `shizi-frontend/pages.config.ts`

- [ ] **Step 1: Rebuild the atlas header and filters**

Show `已掌握 X / 已接触 Y`, a mint progress bar, and filters `全部 / 已掌握 / 待巩固`. Derive tile variants from `getCharacterStatus()`, not only from `charRecords` presence. Replace emoji tile icons with Hanzi, SVG status markers and text labels where needed.

- [ ] **Step 2: Rebuild atlas detail sheet**

Use a bottom sheet with Hanzi, pinyin, example words, audio, replay-origin action and next-review time. Include a close hit area and preserve the current review entry behavior.

- [ ] **Step 3: Add parent gate to me**

When `uiStore.isParentMode` is false, show a simple parent-entry card and open `ParentGate`. After verification show profile, today's summary, needs-review count, report, unit management, learning settings and privacy/data controls. Keep logout and destructive actions visually separated.

- [ ] **Step 4: Create parent report page**

Create `pages/parent-report/index.vue` with PaperPage and SecondaryPageNavbar. Use two metric cards for duration/new/review, two labeled progress rows for immediate/delayed recall, needs-review character chips, next-review summary and one primary `开始巩固` action. Use local store data until `/learning/report` exists; label the source as local when offline.

- [ ] **Step 5: Add route and navigation**

Update `pages.config.ts` only if explicit route metadata is required by the project generator; otherwise let the page plugin generate the route. Add navigation from verified me and unit-complete parent action.

- [ ] **Step 6: Verify parent paths**

Test unverified me, verified me, report with no data, report with needs-review data, unit management, privacy, agreement and data deletion confirmation. Confirm child mode cannot reach settings without the gate.

### Task 9: Add Empty, Offline, Error, and Accessibility States

**Files:**
- Create: `shizi-frontend/src/components/ui/UiEmptyState.vue`
- Create: `shizi-frontend/src/components/ui/UiErrorState.vue`
- Create: `shizi-frontend/src/components/ui/UiOfflineNotice.vue`
- Modify: `shizi-frontend/src/http/interceptor.ts`
- Modify: `shizi-frontend/src/store/learn.ts`
- Modify: `shizi-frontend/src/subpkg-learning/components/learn/LearnFlowHeader.vue`
- Modify: `shizi-frontend/src/subpkg-learning/review/index.vue`

- [ ] **Step 1: Implement reusable state components**

Each component receives an explicit `title`, `description`, `actionText` and emits `action`. Use a small SVG illustration or icon, not Emoji. Ensure the action is at least 88rpx high.

- [ ] **Step 2: Surface offline and sync status**

Expose a non-blocking sync status from the learn store or HTTP interceptor. Learning remains available locally; retry is visible in parent mode. Do not show a permanent error toast on every failed sync.

- [ ] **Step 3: Add reduced-motion and audio fallback behavior**

Respect `uiStore.reducedMotion` in shared transition classes and avoid continuous animation. If audio fails, `AudioPrompt` reveals the fallback text and keeps the task actionable.

- [ ] **Step 4: Audit touch and color semantics**

Check all primary controls for 88rpx hit areas, minimum 16rpx gaps, text+icon state labels and 4.5:1 text contrast. Use `rg` to find remaining Emoji in formal UI templates and replace them with `UiIcon` or content assets.

- [ ] **Step 5: Verify failure paths**

Simulate offline API calls, audio failure, empty review, empty atlas and interrupted navigation. Confirm each state includes cause and recovery action.

### Task 10: Visual Regression, Build, and Handoff

**Files:**
- Create: `docs/ui_paper_classroom_acceptance.md`
- Modify: `docs/ui_acceptance_report.md`
- Modify: `docs/project_master_plan.md`
- Modify: `design/product_ui_design_v3.1.md` only if implementation decisions intentionally differ

- [ ] **Step 1: Run static checks**

```powershell
pnpm -C shizi-frontend lint
pnpm -C shizi-frontend type-check
```

Expected: no new lint or type errors. Existing environment blockers must be documented with their exact command output rather than hidden.

- [ ] **Step 2: Build both targets**

```powershell
pnpm -C shizi-frontend build:h5
pnpm -C shizi-frontend build:mp
```

Expected: both builds complete; MP output contains the `subpkg-learning` pages; H5 output contains home, loot, me and parent-report routes.

- [ ] **Step 3: Perform viewport checks**

Check 375px, 390px and 414px equivalent widths. Record screenshots or device notes for login, onboarding, home, origin, speak, trace, quiz, review, complete, atlas, parent center and report. Confirm no horizontal overflow, bottom safe-area clipping or layout jumps.

- [ ] **Step 4: Perform age-mode checks**

For each age group verify: home copy, task detail visibility, audio prominence, option presentation, trace skip, result detail density and parent gate behavior.

- [ ] **Step 5: Perform interaction checks**

Verify: one primary CTA per page, parent-start/child-handoff, hidden TabBar in learning, predictable back behavior, resume state, audio fallback, review button availability after flip, and end-of-session stopping behavior.

- [ ] **Step 6: Write the acceptance record**

Create `docs/ui_paper_classroom_acceptance.md` with a table containing page, viewport, age mode, state, expected result, actual result and evidence path. Link it from `docs/ui_acceptance_report.md` and update `docs/project_master_plan.md` only after the UI Gate passes.

- [ ] **Step 7: Commit each reviewed batch**

Use separate commits for token foundation, navigation/age state, child flow, review/atlas, parent center and validation. Do not combine unrelated backend or deployment changes into these commits.

## Validation Gate

The UI migration is complete only when all conditions hold:

1. Paper Classroom tokens are used by all touched pages;
2. top-level navigation is 今日/图鉴/我的;
3. 3-4 岁 can complete a lesson without reading long text or entering settings;
4. 5-6 岁 can start the single daily task and complete the child flow;
5. 7-8 岁 can view task details without gaining parent permissions;
6. home exposes one primary CTA;
7. learning and review pages hide TabBar and preserve progress on exit;
8. parent settings, report, unit management and deletion require ParentGate;
9. review uses sky theme and flashcard actions, without purple theme or emoji UI;
10. empty/offline/error/audio states include a recovery action;
11. H5/MP builds pass and viewport checks have evidence;
12. acceptance record and implementation differences are documented.

## Execution Order

Execute Tasks 1-3 first as the shared foundation. Then execute Tasks 4-6 for the primary user journey. Execute Tasks 7-9 for secondary and safety states. Finish with Task 10 and do not start unrelated feature work before the UI Validation Gate passes.
