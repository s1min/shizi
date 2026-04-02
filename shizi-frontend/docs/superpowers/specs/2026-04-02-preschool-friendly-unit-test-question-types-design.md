# Preschool-Friendly Unit Test Question Types Design

## Context
`shizi-frontend/src/subpkg-learning/learn/unit-test.vue` currently allows the `context` question type when a character has example sentences. That produces a “语境选字” card that asks the learner to complete a sentence. This is misaligned with the target preschool audience because it assumes the child can already read surrounding characters in the sentence, so the task starts measuring sentence decoding instead of single-character recognition.

The current unit-test flow already has four direct-recognition question types that fit the learning goal better: `char-to-image`, `image-to-char`, `audio-to-char`, and `pinyin-to-char`. The goal of this change is to make unit testing measure direct recognition only, while preserving sentence/example data for other screens or future age groups.

## Decision
Adopt “product definition of option 2, page effect of option 1”:

- Keep example sentence data in the character model unchanged.
- Remove `context` from the unit-test experience entirely.
- Do not add a replacement question type in this change.
- Keep the existing visual shell, answer flow, feedback behavior, scoring, wrong-record logic, and result page.

## Scope
Only `shizi-frontend/src/subpkg-learning/learn/unit-test.vue` changes.

In scope:
- Remove `context` from the `QuizType` union used by the unit test page.
- Stop adding `context` into the available question-type pool in `generateQuestions()`.
- Remove `context` labels/hints from `buildQuestion()`.
- Remove `context`-specific question building logic (`sentenceSegments` population).
- Remove `context`-specific template branch and scoped styles that are only used by this question type.
- Keep all existing data structures outside this page unchanged.

Out of scope:
- Changes to `Character` data, example sentence storage, or content pipeline.
- Changes to the learning flow pages outside `unit-test.vue`.
- Designing a new replacement question type.
- Reworking scoring, progression, answer feedback, or result-page behavior.

## Rationale
This keeps the unit test aligned with preschool cognition:
- The child should be able to answer by recognizing a single character through image, sound, pinyin, or glyph shape.
- The test should not depend on reading surrounding sentence text.
- Removing the sentence-fill task reduces unnecessary frustration and makes the score more representative of actual recognition ability.

It also keeps implementation risk low because the change is subtractive: one unsuitable question type is removed without introducing a new branch of product logic.

## Expected User Experience
After the change:
- The unit-test page never shows “语境选字”.
- Every question remains directly answerable by a preschool learner.
- The page still feels like the same learning-flow continuation; no new layout or control pattern is introduced.
- Difficulty becomes more stable because all question types rely on direct recognition cues.

## Technical Notes
The page currently contains a full `context` branch across type definitions, generation, rendering, and styling. This change should remove that branch cleanly rather than leaving dead code behind.

The final `QuizType` set for `unit-test.vue` should be:
- `char-to-image`
- `image-to-char`
- `audio-to-char`
- `pinyin-to-char`

Example sentence data remains available in the character model so future pages can still use it deliberately.

## Verification
Verify all of the following after implementation:
- `unit-test.vue` no longer generates `context` questions.
- The page no longer renders “语境选字”.
- The remaining four question types still generate and render correctly.
- Audio questions still auto-play on entry where they did before.
- Wrong-answer feedback, retry flow, wrong-record tracking, scoring, and result-page logic still behave the same.
- ESLint passes for the modified file.

## Risks and Mitigations
- **Risk:** Removing one question type could accidentally reduce per-unit variety too much.
  - **Mitigation:** Acceptable for now because lower cognitive burden is the priority for the preschool audience.
- **Risk:** Dead template/style/type branches could be left behind.
  - **Mitigation:** Treat this as a clean removal, not just a generation toggle.
