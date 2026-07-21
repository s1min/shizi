# Wot Icon Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace functional icons in the uni-app frontend with wot-design-uni `wd-icon` components.

**Architecture:** Keep icon selection in page templates and centralize tabbar rendering in `TabbarItem.vue`. Preserve semantic images and existing interaction handlers; only replace visual glyphs and legacy icon class branches.

**Tech Stack:** Vue 3, uni-app, TypeScript, wot-design-uni, UnoCSS.

---

### Task 1: Centralize tabbar icons

**Files:** `src/tabbar/types.ts`, `src/tabbar/config.ts`, `src/tabbar/TabbarItem.vue`, `src/tabbar/index.vue`

- [x] Change custom tabbar entries to `iconType: 'uiLib'` and wot names.
- [x] Render one `wd-icon` branch with active/inactive color inherited from the tabbar item.
- [x] Remove legacy UnoCSS/iconfont rendering branches and dead helper logic.

### Task 2: Replace navigation and account icons

**Files:** `src/pages/login/index.vue`, `src/pages/loot/index.vue`, `src/pages/me/index.vue`, `src/pages/onboarding/index.vue`

- [x] Replace back, close, check, arrow, and account/menu glyphs with `wd-icon`.
- [x] Preserve avatar and book illustration semantics.

### Task 3: Replace learning controls and feedback icons

**Files:** `src/pages/home/index.vue`, `src/subpkg-learning/learn/unit-complete.vue`, `src/subpkg-learning/learn/unit-test.vue`, `src/subpkg-learning/components/learn/CharCard.vue`, `src/subpkg-learning/components/learn/QuizCard.vue`, `src/subpkg-learning/components/learn/SpeakPractice.vue`, `src/subpkg-learning/components/learn/TracingPractice.vue`

- [x] Replace play, volume, close, star, lock, edit, delete, pause, and feedback glyphs with `wd-icon`.
- [x] Keep content emoji used as character/illustration data unchanged.

### Task 4: Remove legacy iconfont references and verify

**Files:** `src/style/index.scss`, `src/style/iconfont.css`, `uno.config.ts`

- [x] Remove unused iconfont import/comment and unused iconfont stylesheet.
- [x] Remove icon safelist entries that are no longer used.
- [x] Run source searches, type-check, lint, and H5 build.
