# Paper Classroom UI 验收记录

更新日期：2026-07-20

本记录覆盖本轮儿童识字产品 UI 迁移。产品采用“家长启动、孩子接管、按年龄逐步放权”的交互模型，视觉基线为 `design-system/quzibao/MASTER.md`。

## 自动化门禁

| 项目 | 命令 | 结果 | 证据 |
|---|---|---|---|
| H5 构建 | `pnpm -C shizi-frontend build:h5` | 通过 | `DONE Build complete` |
| 微信小程序构建 | `pnpm -C shizi-frontend build:mp` | 通过 | `DONE Build complete` |
| 类型检查 | `pnpm -C shizi-frontend type-check` | 通过 | `vue-tsc --noEmit` |
| 目标文件 ESLint | `pnpm -C shizi-frontend exec eslint ...` | 通过 | 无 lint error |
| 差异检查 | `git diff --check` | 通过 | 无空白错误 |

## 页面与状态验收

| 页面/流程 | 视口 | 年龄模式 | 状态 | 预期结果 | 当前结果 | 证据/备注 |
|---|---:|---|---|---|---|---|
| 登录 | 375/390/414 | 全部 | 首次进入 | 微信登录、本地体验、隐私协议清晰可达 | 已实现 | `src/pages/login/index.vue` |
| 引导 | 375/390/414 | 3-4 / 5-6 / 7-8 | 年龄→字库→计划 | 每步一个主 CTA，低龄字库不可用时明确说明 | 已实现 | `src/pages/onboarding/index.vue` |
| 今日首页 | 375/390/414 | 3-4 | 首次/完成/离线 | 只有“开始今天的学习”，图片/语音优先 | 已实现 | `src/pages/home/index.vue` |
| 今日首页 | 375/390/414 | 5-6 | 继续/待复习 | 系统编排任务，孩子无需理解复杂入口 | 已实现 | `src/pages/home/index.vue` |
| 今日首页 | 375/390/414 | 7-8 | 任务详情 | 可查看任务详情但不能进入家长设置 | 已实现 | `src/pages/home/index.vue` |
| 学习流程 | 375/390/414 | 全部 | 中断/恢复 | 隐藏 TabBar，退出确认并保留进度 | 已实现 | `src/subpkg-learning/learn/index.vue` |
| 学习流程 | 375/390/414 | 3-4 | 描红 | 显示“可以跳过”，文字弱化、声音优先 | 已实现 | `TracingPractice.vue` |
| 复习 | 375/390/414 | 全部 | 有/无待复习 | 天空蓝闪卡，翻面后“认识/不认识”始终可用 | 已实现 | `src/subpkg-learning/review/index.vue` |
| 单元测试 | 375/390/414 | 全部 | 单题/反馈 | 单题单屏，显示“还剩 X 题”，反馈后显式继续 | 已实现 | `src/subpkg-learning/learn/unit-test.vue` |
| 单元结算 | 375/390/414 | 全部 | 完成 | “结束学习”为主 CTA，统计和待巩固信息可见 | 已实现 | `src/subpkg-learning/learn/unit-complete.vue` |
| 图鉴 | 375/390/414 | 全部 | 空/有数据 | 已掌握/已接触统计，全部/已掌握/待巩固筛选 | 已实现 | `src/pages/loot/index.vue` |
| 我的 | 375/390/414 | 全部 | 未验证 | 仅显示家长入口，不暴露设置和报告 | 已实现 | `src/pages/me/index.vue` |
| 家长报告 | 375/390/414 | 家长 | 无/有数据 | 本地数据标识、即时/延迟回忆率、待巩固和下一步 | 已实现 | `src/pages/parent-report/index.vue` |
| 单元管理 | 375/390/414 | 家长 | 直达路由 | 未验证时先弹出家长验证 | 已实现 | `src/pages/unit-list/index.vue` |
| 隐私/协议 | 375/390/414 | 家长/公开 | 阅读/删除 | 使用家长导航，删除说明与正文分离 | 已实现 | `src/pages/privacy/index.vue`、`agreement/index.vue` |

## 交互边界

- `3-4 岁`由家长启动入口，孩子在学习流程中只接触图片、声音和大触控区。
- `5-6 岁`可从首页直接开始今日任务，系统隐藏复习/新字的复杂分流。
- `7-8 岁`可看任务详情，但报告、单元管理、设置和数据删除都仍需 `ParentGate`。
- 学习和复习页面通过 `PaperPage hideTabbar` 使用引用计数隐藏 TabBar，离开后恢复。
- 正式 UI 图标使用 `UiIcon`；题型中的 `emoji_fallback` 仅作为内容素材显示，不属于导航或状态图标。
- 音频失败时 `AudioPrompt` 显示文字 fallback；同步失败时保留本地学习并显示恢复提示。

## 尚需人工完成

本轮无法在当前自动化环境完成真机视觉截图和触控回归。提审前需要使用微信开发者工具及至少一台 iOS、Android 设备验证 375/390/414 等效宽度、刘海安全区、键盘弹出、音频失败和返回恢复路径，并将截图路径补入本表。
