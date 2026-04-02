# Unit Test Result Page Cleanup Design

## Context
`shizi-frontend/src/subpkg-learning/learn/unit-test.vue` currently reuses part of the in-question feedback presentation into the result state. In the finished result screen, the bottom feedback dock can remain visible even though the page has already transitioned from single-question interaction into full-test summary. This creates a mixed state: the page says the test is finished, but a leftover per-question success message still occupies the bottom of the screen.

At the same time, the result screen needs tighter visual consistency. The title, score, stats, helper copy, wrong-character review, and star row currently feel like adjacent pieces rather than one clear summary hierarchy. The user requested four concrete changes:
- hide the per-question feedback module on the result page
- unify typography and color usage across the result page
- place pinyin above each wrong character
- replace `⭐ / ☆` with `wd-icon` `star-filled` / `star`

## Decision
Treat the unit-test result screen as a dedicated summary state, not an extension of question feedback.

This means:
- the bottom feedback dock belongs only to the answering state and must not render when `testDone` is true
- the result page keeps only three primary blocks: summary card, wrong-character review card, and action area
- the wrong-character review card becomes a compact review grid with pinyin above each character
- the star row uses `wd-icon` icons for stable sizing and state styling

## Scope
Only `shizi-frontend/src/subpkg-learning/learn/unit-test.vue` changes.

In scope:
- Gate the feedback dock so it disappears on the result page.
- Adjust the result summary card’s text hierarchy, spacing, and colors.
- Replace star glyphs with `wd-icon` usage.
- Reorder wrong-review item content to `pinyin -> character`.
- Normalize result-page typography and color roles.

Out of scope:
- Changes to question-generation logic.
- Changes to answer feedback copy during the question flow.
- Changes to `unit-complete.vue`.
- Introducing new result actions or reward mechanics.

## Rationale
This separation is important for children’s learning products:
- Single-question feedback should be immediate and lightweight.
- Full-page completion feedback should be summary-oriented and calm.
- Mixing the two creates visual noise and weakens the page’s main task.

The result screen should answer only these questions:
- How did I do?
- Which characters need more practice?
- What should I do next?

Everything on the page should serve one of those three goals.

## Expected User Experience
After the change:
- The result screen no longer shows leftover “答对啦” feedback at the bottom.
- The visual center is the result summary card, not a stray dock.
- Typography becomes more predictable: large title, clear key numbers, lighter supporting copy.
- Wrong-review cards are easier to scan because pinyin is above the character and all review items follow the same reading order.
- Star visuals feel more polished and consistent because they use `wd-icon` rather than text characters.

## Visual Rules
Use one consistent hierarchy across the result page:
- **Primary title:** result title only
- **Key metrics:** score and stat numbers
- **Module title:** wrong-review heading
- **Body text:** summary sentence and review description
- **Secondary text:** hints and labels

Use only these color roles:
- primary text: deep brown
- supporting text: medium brown
- secondary text: light brown-gray
- accent/status: star fill, CTA, and light review-card emphasis only

Avoid introducing separate color systems for each block.

## Component-Level Notes
### Feedback dock
Render only during the answering state. The result page must not show it.

### Summary card
Keep:
- badge
- stars
- result title
- score
- stats
- summary text
- next-step hint

But tighten them into one consistent visual rhythm and type scale.

### Wrong review
Keep it as a separate review card when `wrongList.length > 0`, but each item should display:
1. pinyin
2. character

The review area should feel like a practice reminder, not a tag cloud.

### Stars
Use `wd-icon`:
- inactive: `star`
- active: `star-filled`

Style them through class-based state rather than relying on emoji glyph rendering.

## Verification
Verify all of the following after implementation:
- the feedback dock does not appear when `testDone` is true
- the result page still renders correctly for pass and fail states
- `wd-icon` stars render correctly for 0, 1, 2, and 3 stars
- wrong-review items show pinyin above the character
- the result page keeps existing actions and navigation behavior
- ESLint passes for the modified file

## Risks and Mitigations
- **Risk:** Hiding the dock could accidentally hide feedback during the answering state.
  - **Mitigation:** Gate only on the result state and recheck retry / success / final-error flows.
- **Risk:** Reordering wrong-review content could break spacing or alignment.
  - **Mitigation:** Keep a fixed card structure for each review item and use the same alignment rules for all items.
- **Risk:** `wd-icon` stars may render with different spacing than text stars.
  - **Mitigation:** Define explicit icon size, gap, and active/inactive color states in the result card styles.
