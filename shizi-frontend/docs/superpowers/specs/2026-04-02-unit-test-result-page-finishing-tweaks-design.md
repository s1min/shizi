# Unit Test Result Page Finishing Tweaks Design

## Context
The unit-test result page in `shizi-frontend/src/subpkg-learning/learn/unit-test.vue` has already been cleaned up structurally: the result summary, wrong-review area, and actions are separated, and the leftover question feedback dock is no longer part of the intended result-state design. The remaining work is finishing polish rather than structural redesign.

Three refinements are still needed:
- strengthen the spacing rhythm between the result summary card, wrong-review card, and action area
- make the wrong-review items feel more like compact preschool review cards and less like loose tags
- soften the emotional tone of the star row so it reads as encouragement rather than exam scoring

## Decision
Use a light-touch finishing pass only. Keep the current result-page structure, content, actions, and data logic intact.

This pass changes only:
- module-level spacing
- wrong-review card density and card feel
- star color intensity

It does not introduce new blocks, new interactions, or new copy.

## Scope
Only `shizi-frontend/src/subpkg-learning/learn/unit-test.vue` changes.

In scope:
- increase the spacing separation between `result-summary-card`, `wrong-review`, and `result-actions`
- tune `wrong-char-item`, `wrong-char`, and `wrong-pinyin` so the review area reads as a tidy set of learning cards
- soften active and inactive star presentation without changing the number or placement of stars

Out of scope:
- changing result-page layout structure
- changing result-page copy
- changing scoring or star thresholds
- changing button behavior or navigation
- changing question-flow UI

## Rationale
At this stage, the page is already functionally correct. The problem is finishing quality:
- the summary and review sections need clearer module boundaries
- the review items should look like learning material rather than metadata chips
- stars should reward without adding pressure, especially for low-score outcomes

For a preschool learning product, these are not cosmetic-only details. Visual softness and clear grouping directly affect how supportive or punitive the page feels.

## Expected User Experience
After the finishing pass:
- the result summary card remains the clear visual center
- the wrong-review card feels like a separate, secondary learning block
- the wrong-review items scan as small review cards with stable rhythm
- the star row feels gentler in 0-star and 1-star outcomes while still giving a sense of completion in 2-star and 3-star outcomes

## Visual Rules
### Module spacing
Treat result-page blocks as distinct modules:
- summary card = primary module
- wrong-review card = secondary module
- actions = persistent bottom action area

Use larger spacing between modules than within modules.

### Wrong-review density
Wrong-review items should read as a compact set of preschool review cards:
- stable item width feel
- consistent pinyin-to-character spacing
- aligned card shapes and rhythm
- clear distinction between the review card container and the individual review items inside it

### Star tone
Stars keep the same semantic meaning, but shift in emotional tone:
- inactive stars become lighter and quieter
- active stars remain warm yellow but less sharp
- the row should feel celebratory, not judgmental

## Verification
Verify all of the following after implementation:
- spacing between the summary card, wrong-review card, and action area is visibly clearer
- wrong-review items feel more regular and card-like
- pinyin and character remain easy to scan in each review item
- stars still clearly show 0/1/2/3 states
- low-star outcomes feel visually softer than before
- ESLint passes for the modified file

## Risks and Mitigations
- **Risk:** Increasing spacing could make the page feel too empty on taller screens.
  - **Mitigation:** Adjust only one spacing tier upward and keep the action area anchored near the bottom.
- **Risk:** Making wrong-review items more card-like could make the lower section too visually heavy.
  - **Mitigation:** Increase structure through rhythm and alignment more than through borders or shadows.
- **Risk:** Softening stars too much could weaken reward clarity.
  - **Mitigation:** Keep active/inactive contrast clear even after reducing intensity.
