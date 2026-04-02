# Preschool-Friendly Unit Test Question Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the preschool-inappropriate `context` question type from the unit test page while preserving all remaining question flows, feedback behavior, scoring, and results.

**Architecture:** Keep this change local to `src/subpkg-learning/learn/unit-test.vue`. Remove the `context` branch from the page’s type definitions, template, generation logic, and scoped styles so the page only uses direct-recognition question types (`char-to-image`, `image-to-char`, `audio-to-char`, `pinyin-to-char`) without altering store data or other learning-flow pages.

**Tech Stack:** Vue 3 SFC (`<script setup lang="ts">`), TypeScript, Uni App, ESLint

---

## File Structure

- Modify: `src/subpkg-learning/learn/unit-test.vue`
  - Remove `context` from the page-local `QuizType` union.
  - Remove `sentenceSegments` from the page-local `Question` interface.
  - Remove the `context` render branch in the template.
  - Remove `context` generation from `generateQuestions()` / `buildQuestion()`.
  - Remove `context`-only computed class and scoped styles.
- Read during implementation: `docs/superpowers/specs/2026-04-02-preschool-friendly-unit-test-question-types-design.md`
  - Confirm scope and verification targets.

### Task 1: Remove `context` from unit-test question generation

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:201-211`
- Modify: `src/subpkg-learning/learn/unit-test.vue:452-529`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Since this repo does not currently expose a dedicated unit-test runner for this page, use a source-level guard test first by asserting that the file still contains the old `context` branch before removing it.

Expected pre-change snippets in `src/subpkg-learning/learn/unit-test.vue`:

```ts
type QuizType = 'char-to-image' | 'image-to-char' | 'audio-to-char' | 'pinyin-to-char' | 'context'
```

```ts
if (char.example_sentences?.length > 0) {
  types.push('context')
}
```

```ts
'context': '语境选字',
```

```ts
'context': '选择合适的字填空',
```

- [ ] **Step 2: Run test to verify it fails after removal target is defined**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the current baseline is stable and the file is ready to change.

- [ ] **Step 3: Write minimal implementation**

Update the type and generation code in `src/subpkg-learning/learn/unit-test.vue` to exactly this shape:

```ts
type QuizType = 'char-to-image' | 'image-to-char' | 'audio-to-char' | 'pinyin-to-char'

interface Question {
  type: QuizType
  typeLabel: string
  hint: string
  targetChar: string
  targetEmoji?: string
  targetPinyin?: string
  options: { char?: string, emoji?: string, isCorrect: boolean }[]
}
```

```ts
function generateQuestions(chars: Character[], allChars: Character[]) {
  const qs: Question[] = []

  function getAvailableTypes(char: Character): QuizType[] {
    const types: QuizType[] = ['pinyin-to-char', 'audio-to-char']
    const hasEmoji = !!char.teaching?.emoji_fallback
    if (hasEmoji) {
      types.push('char-to-image', 'image-to-char')
    }
    return types
  }

  for (const char of chars) {
    const available = getAvailableTypes(char)
    const shuffledTypes = shuffle(available)
    const selectedTypes = shuffledTypes.slice(0, 2)

    for (const type of selectedTypes) {
      const distractors = getDistractors(char, allChars, 3)
      const q = buildQuestion(char, type, distractors)
      qs.push(q)
    }
  }

  return shuffle(qs)
}
```

```ts
function buildQuestion(char: Character, type: QuizType, distractors: Character[]): Question {
  const typeLabels: Record<QuizType, string> = {
    'char-to-image': '看字选图',
    'image-to-char': '看图选字',
    'audio-to-char': '听音选字',
    'pinyin-to-char': '看拼音选字',
  }
  const hints: Record<QuizType, string> = {
    'char-to-image': '选择正确的图片',
    'image-to-char': '选择正确的汉字',
    'audio-to-char': '听发音，选汉字',
    'pinyin-to-char': '选择正确的汉字',
  }

  return {
    type,
    typeLabel: typeLabels[type],
    hint: hints[type],
    targetChar: char._id,
    targetEmoji: char.teaching?.emoji_fallback,
    targetPinyin: char.pinyin,
    options: shuffle([
      { char: char._id, emoji: char.teaching?.emoji_fallback || '❓', isCorrect: true },
      ...distractors.map(d => ({
        char: d._id,
        emoji: d.teaching?.emoji_fallback || '❓',
        isCorrect: false,
      })),
    ]),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no ESLint errors for the updated file.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: remove context questions from unit test

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 2: Remove `context` from rendering and styles

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue:12-48`
- Modify: `src/subpkg-learning/learn/unit-test.vue:281-284`
- Modify: `src/subpkg-learning/learn/unit-test.vue:705-735`
- Test: `src/subpkg-learning/learn/unit-test.vue`

- [ ] **Step 1: Write the failing test**

Before editing, confirm the page still contains the `context` UI branch and styles that should be removed.

Expected pre-change snippets in `src/subpkg-learning/learn/unit-test.vue`:

```vue
<div v-else-if="currentQuestion.type === 'context'" class="question-context-block">
```

```ts
const questionCardClass = computed(() => ({
  'is-context': currentQuestion.value?.type === 'context',
}))
```

```scss
.question-context-block {
```

- [ ] **Step 2: Run test to verify it fails after removal target is defined**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS before edits, confirming the current file is valid before removing the render/style branch.

- [ ] **Step 3: Write minimal implementation**

Update the template and script to this shape:

```vue
<div v-if="!testDone && currentQuestion" class="question-area">
  <div class="question-card learning-quiz-question-card">
    <div class="question-meta learning-quiz-question-meta">
      <div class="quiz-type learning-quiz-type">
        {{ currentQuestion.typeLabel }}
      </div>
      <div class="question-hint learning-quiz-hint">
        {{ currentQuestion.hint }}
      </div>
    </div>

    <div class="question-content learning-quiz-content">
      <div v-if="currentQuestion.type === 'char-to-image'" class="question-char learning-quiz-char">
        {{ currentQuestion.targetChar }}
      </div>
      <div v-else-if="currentQuestion.type === 'image-to-char'" class="question-image learning-quiz-image">
        {{ currentQuestion.targetEmoji }}
      </div>
      <button v-else-if="currentQuestion.type === 'audio-to-char'" class="btn-audio learning-quiz-audio-btn" @click="playQuestionAudio">
        <text class="audio-icon learning-quiz-audio-icon">{{ isPlaying ? '🔊' : '🔈' }}</text>
        <text>{{ isPlaying ? '播放中...' : '再听一遍' }}</text>
      </button>
      <div v-else-if="currentQuestion.type === 'pinyin-to-char'" class="question-pinyin learning-quiz-pinyin">
        {{ currentQuestion.targetPinyin }}
      </div>
    </div>
  </div>
```

Remove the unused computed entirely:

```ts
const currentQuestion = computed(() => questions.value[currentIndex.value])
```

Delete these scoped style blocks completely:

```scss
.question-card {
  &.is-context {
    align-items: stretch;
  }
}

.question-context-block {
  width: 100%;
  padding: 24rpx 24rpx 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 251, 244, 0.96) 0%, rgba(255, 247, 238, 0.92) 100%);
  box-shadow: inset 0 0 0 2rpx rgba(247, 225, 196, 0.72);
}

.question-sentence {
  font-size: 48rpx;
  line-height: 1.7;
  color: #4a3728;
  text-align: center;

  .blank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 88rpx;
    margin: 0 8rpx;
    color: #e39a22;
    font-weight: 700;
    border-bottom: 4rpx solid rgba(227, 154, 34, 0.72);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Expected: PASS with no unused types/computed/style-related lint errors.

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
feat: remove context question UI from unit test

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Task 3: Verify preschool-friendly unit test behavior end to end

**Files:**
- Modify: `src/subpkg-learning/learn/unit-test.vue` (only if verification exposes an issue)
- Test: `src/subpkg-learning/learn/unit-test.vue`
- Read: `docs/superpowers/specs/2026-04-02-preschool-friendly-unit-test-question-types-design.md`

- [ ] **Step 1: Write the failing test**

Use a manual verification checklist derived from the spec. The implementation is not complete unless one of these fails before the code is corrected.

Checklist:

```md
- unit test never shows 语境选字
- only four question types remain: 看图选字 / 看字选图 / 听音选字 / 看拼音选字
- audio question still auto-plays on first render
- wrong-answer retry flow still shows 底部反馈 and retry actions
- correct answer still advances as before
- result page still renders and keeps wrong-list / accuracy behavior
```

- [ ] **Step 2: Run test to verify it fails**

Run the project and navigate to the unit test page for a character set that previously could produce `context`:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm dev:mp-weixin
```

Expected before fix completion: if `语境选字` still appears anywhere, the check FAILS and implementation must continue.

- [ ] **Step 3: Write minimal implementation**

If manual verification exposes leftover `context` references, remove them from `src/subpkg-learning/learn/unit-test.vue` and keep the final page behavior aligned with the spec:

```ts
// Final page-local question types only
'char-to-image' | 'image-to-char' | 'audio-to-char' | 'pinyin-to-char'
```

```vue
<!-- Final rendered prompt branches only -->
v-if="currentQuestion.type === 'char-to-image'"
v-else-if="currentQuestion.type === 'image-to-char'"
v-else-if="currentQuestion.type === 'audio-to-char'"
v-else-if="currentQuestion.type === 'pinyin-to-char'"
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && npx eslint "src/subpkg-learning/learn/unit-test.vue"
```

Then verify in the app:

```bash
cd "/d/MyDir/shizi/shizi-frontend" && pnpm dev:mp-weixin
```

Expected:
- No `语境选字`
- Remaining four question types render correctly
- Audio auto-play still works
- Feedback / scoring / result flow unchanged

- [ ] **Step 5: Commit**

```bash
cd "/d/MyDir/shizi/shizi-frontend" && git add "src/subpkg-learning/learn/unit-test.vue" && git commit -m "$(cat <<'EOF'
test: verify preschool-friendly unit test question flow

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Self-Review

### Spec coverage
- Remove `context` from unit-test experience entirely → Task 1 and Task 2
- Keep example sentence data unchanged → confined edits to `unit-test.vue` only
- Do not add replacement question type → no new type introduced in any task
- Preserve feedback/scoring/result behavior → Task 3 verification explicitly checks these flows
- ESLint passes → included in every task verification

### Placeholder scan
- Removed placeholders like TBD/TODO.
- Every task includes exact file paths, code targets, commands, and expected outcomes.

### Type consistency
- Final `QuizType` set is consistently defined as four values across all tasks.
- `Question` interface no longer includes `sentenceSegments` after Task 1.
- Template branches in Task 2 match the final `QuizType` set from Task 1.
