# Learn Flow Step 3 Tracing UI Design

> **For agentic workers:** This spec defines the UI and interaction design for the Step 3 tracing stage only. Do not implement until the user reviews and approves this spec.

**Goal:** Reframe Step 3 "写一写" as a focused writing-training screen where the tracing canvas is the single visual center and all surrounding UI serves the writing task.

**Scope:** `shizi-frontend/src/subpkg-learning/components/learn/TracingPractice.vue` and any minimal parent-level adjustments needed to preserve consistency with the learning flow shell.

---

## 1. Product intent

Step 3 is not a utility panel. It is a writing practice stage inside a guided learning flow.

Its job is simple:

- help the child understand which character is being practiced
- keep attention on the tracing canvas
- make the next recommended action obvious
- unlock flow progression only after at least one valid practice pass

This stage should feel calmer and more focused than Step 2. Step 1 is for looking, Step 2 is for listening/responding, and Step 3 is for writing. The UI must narrow attention accordingly.

## 2. Core design principles

### 2.1 One visual center
The tracing canvas is the only visual center on the screen. No header block, feedback module, or tool bar may visually compete with it.

### 2.2 Tool actions are not primary actions
Buttons such as 清除 / 示范 / 测试 are training tools, not flow exits. They must be visually lighter than the bottom flow buttons and lighter than the canvas itself.

### 2.3 Task-first wording
Status copy should tell the child what to do now, not explain the system.

Preferred wording direction:
- 先看示范，再开始写
- 跟着笔顺写一写
- 这一遍完成，可以继续了

Avoid long instructional copy and avoid parallel multi-action explanations.

### 2.4 Flow consistency
Step 3 must keep the same shell logic already established in previous steps:
- top learning flow remains unchanged
- bottom 上一步 / 下一步 remains the formal navigation exit
- state colors follow existing semantics: current, done, success, error, disabled
- spacing, card weight, and button language match the rest of the learning flow

## 3. Layout specification

The vertical structure should be:

1. lightweight character header
2. large tracing canvas block
3. slim status prompt
4. tool action row
5. light practice feedback
6. bottom flow actions

### 3.1 Character header
Content:
- current character
- pinyin
- stroke-count badge

Requirements:
- compact and close to the canvas
- no heavy standalone card treatment
- reads as the title of the writing exercise, not a separate module

Visual intent:
- the character remains the strongest text in this header
- pinyin is clearly secondary
- stroke count is a small supporting badge

### 3.2 Tracing canvas block
The tracing board should remain the largest and calmest area.

Requirements:
- preserve the square writing board as the dominant shape
- keep the grid and ghost character visible enough for guidance
- reduce decorative noise around the board
- keep the board inside a light card only; do not stack multiple nested cards

Visual intent:
- clean
- stable
- writable
- reassuring

### 3.3 Status prompt
The current status area should become a slim task prompt directly below the canvas.

It should communicate only the current task state:
- default: 先看示范，再开始写
- demo: 正在看笔顺
- quiz: 跟着笔顺写一写
- ready: 这一遍完成，可以继续了

Requirements:
- lightweight treatment
- shorter copy than the current implementation
- visually attached to the canvas section, not floating as a separate content block

### 3.4 Tool action row
The row should keep three tool positions:
- 清除
- 示范
- 测试 / 下一笔

Requirements:
- same size system
- same corner radius system
- same layout logic
- emphasis comes from semantic color, not different shapes

Semantic roles:
- 清除: neutral secondary tool
- 示范: recommended default tool action
- 测试 / 下一笔: current training progression action within the tracing stage

Important:
- these buttons must not visually outrank the bottom 下一步 button
- these buttons must not visually outrank the canvas

### 3.5 Practice feedback
The practice count should remain, but only as light reinforcement.

Requirements:
- present as small progress feedback below the tools
- do not isolate it into a heavy card
- when threshold is met, confirm lightly instead of celebrating loudly

Suggested wording direction:
- 今天已练习 0 次
- 已完成本字练习

### 3.6 Bottom flow actions
Keep the existing two-button flow structure:
- 上一步
- 下一步

Rules:
- this remains the only formal navigation exit for the stage
- 下一步 stays disabled until minimum valid practice is achieved
- unlocking should feel natural, not dramatic

## 4. Interaction specification

### 4.1 Entry state
On entering Step 3:
- focus lands visually on the canvas
- status prompt recommends “先看示范，再开始写”
- 示范 is the recommended first tool action
- 下一步 remains disabled

### 4.2 Demo state
When 示范 is tapped:
- status prompt switches to a viewing-state message
- demo button enters active state
- competing tool emphasis is reduced
- the canvas is the only moving element with visual focus

After demo completion:
- return to calm default state
- practice progress can increment
- copy should gently shift toward trying the writing action

### 4.3 Quiz / tracing state
When 测试 is tapped:
- page clearly shifts from “watch” to “write”
- status prompt changes to a writing-task prompt
- 测试 swaps to 下一笔 when needed by the current logic
- 清除 remains available
- 示范 is weakened or made temporarily unavailable if needed for focus

### 4.4 Feedback behavior
Feedback inside Step 3 should be light and instructional.

Rules:
- correct feedback should confirm without interrupting flow
- mistake feedback should guide, not punish
- avoid strong popup-style interruptions while writing
- prefer local UI feedback through the board and status prompt

### 4.5 Completion threshold
At least one valid practice pass is enough to unlock 下一步.

When threshold is reached:
- the next button transitions from disabled to enabled
- the status prompt gives a short completion confirmation
- no heavy celebration screen should appear inside Step 3

## 5. Visual language rules

### 5.1 Weight order
Visual priority must be:
1. tracing canvas
2. character header
3. current status prompt
4. tool action row
5. practice feedback
6. bottom flow actions as structural exits

The bottom buttons remain structurally important, but the canvas must still be the visual star.

### 5.2 Card strategy
Only two layers are desirable here:
- page background
- light tracing board card

Avoid turning the header, status prompt, and feedback area into separate heavy cards.

### 5.3 Color semantics
Continue the established learning-flow semantics:
- warm gold for current flow emphasis and primary progression cues
- green for done/success states
- neutral warm gray-brown for helper text and inactive states
- red only for light incorrect guidance, never for punitive emphasis

## 6. Consistency with steps 1 and 2

Step 3 should feel like the writing-specific continuation of the same product system.

Must stay consistent with prior steps in:
- top flow shell
- bottom action pattern
- button families
- card weight
- warm educational tone
- short feedback language

Distinctive difference from Step 2:
- Step 2 centers listening and choosing
- Step 3 centers writing and motor focus
- therefore Step 3 should be calmer, cleaner, and more spatially centered

## 7. Success criteria

The redesign is successful if:
- the tracing canvas is clearly the first thing the eye lands on
- the page feels like a writing exercise, not a general-purpose tool page
- the child can always tell what to do next from the status prompt and button emphasis
- the page visually fits with Step 1 and Step 2 without repeating their interaction patterns
- unlocking 下一步 feels earned but not ceremonious
