# Learn Flow Final Completion Step Design

> **For agentic workers:** This spec defines the completion-step UI and interaction design for the final `complete` state only. Do not implement until the user reviews and approves this spec.

**Goal:** Redesign the single-character completion step as a lightweight in-page completion screen that confirms mastery, keeps the learned character as the visual focus, and naturally advances the child into the next character.

**Scope:** `shizi-frontend/src/subpkg-learning/learn/index.vue` and any minimal local styling or template adjustments needed for the `complete` state.

---

## 1. Product intent

The final completion step is not a popup reward moment. It is the natural closing state of the single-character learning flow.

Its job is to:
- confirm that this character has been completed
- keep the child aware of which character they just learned
- provide a calm and confident sense of progress
- move the child forward to the next character without interruption

This step should feel warmer and slightly more relaxed than Step 4, but still belong to the same learning-flow system.

## 2. Core decision

### 2.1 Interaction form
The completion step should remain an **in-page completion screen**.

It should **not** be implemented as a modal, popup, toast, or overlay.

### 2.2 Why this is the chosen direction
Reasons:
- it preserves learning-flow continuity
- it avoids interrupting the child with a system-layer interaction
- it matches the UI direction already established in Steps 1–4: lighter feedback, fewer popups, stronger in-page state expression
- it makes progression feel natural rather than ceremonious

### 2.3 What this screen is not
This is not:
- a confirmation dialog
- a reward popup
- a game-style victory screen
- a multi-action decision point

It is a calm completion page for one learned character.

## 3. Layout specification

The vertical structure should be:

1. lightweight completion badge
2. large learned-character display
3. short primary completion message
4. optional single-line secondary message
5. one primary action button

### 3.1 Completion badge
The top badge should be small and refined.

Requirements:
- circular or soft rounded badge
- use a check-style completion symbol rather than celebratory emoji as the main final design
- color should suggest completion softly, such as warm green or green-gold
- visually supportive, not dominant

Visual intent:
- reads as “completed”
- gives light emotional lift
- does not compete with the learned character

### 3.2 Learned character display
The learned character remains the main visual center.

Requirements:
- centered on screen
- strongest visual element on the page
- continue using the existing educational/calligraphic character style
- keep enough surrounding whitespace so the page feels like a calm landing state

Visual intent:
- the child should instantly understand which character was completed
- the page should close the loop of the prior steps by returning attention to the character itself

### 3.3 Primary completion message
Recommended primary copy:

`你已经学会「{{ currentChar._id }}」啦`

Requirements:
- one short sentence only
- warm and child-friendly
- more specific than generic praise
- should confirm the exact learned character rather than only saying “completed”

### 3.4 Secondary message
Recommended secondary copy:

`继续学习下一个字`

Requirements:
- optional but recommended
- lighter than the primary message
- one line only
- should gently prepare the next action rather than repeat the button label too heavily

### 3.5 Primary action button
Button label:

`继续学习`

Requirements:
- only one primary action button on this screen
- re-use the existing learning-flow primary button language
- no secondary CTA is needed in the default design
- this button should be the only formal next-step action

## 4. Interaction specification

### 4.1 Entry behavior
When the user completes Step 4 successfully enough to move into the completion state:
- the learning content area transitions into the completion screen
- no popup or overlay should appear
- the page should feel like a natural continuation of the flow rather than a separate system event

### 4.2 Visual emphasis order
Priority should be:
1. learned character
2. primary completion message
3. primary action button
4. completion badge
5. secondary message

The character remains the hero, not the badge.

### 4.3 Action behavior
When the child taps `继续学习`:
- if another character remains in the unit, advance to that character and reset the flow
- if the unit is complete, continue into the unit-level next experience already defined by the page logic

### 4.4 Motion behavior
Motion should be light and calm.

Allowed motion direction:
- badge soft fade/settle in
- character and copy light fade-in
- button slightly delayed fade-in or rise-in

Not allowed:
- modal-style pop-in
- explosive celebration
- particle effects
- repeated bouncing or pulsing
- anything that feels louder than the earlier learning steps

## 5. Visual language rules

### 5.1 Tone
The completion screen should feel:
- warm
- confident
- complete
- calm
- encouraging

It should not feel:
- noisy
- overly gameified
- overly ceremonial
- system-like

### 5.2 Card strategy
Prefer a light, open layout rather than a heavy result card.

The screen should feel like a page state, not a card dropped on top of a page.

### 5.3 Color semantics
Use the existing learning-flow palette:
- deep ink for the learned character
- warm brown for primary educational text
- lighter neutral brown for secondary text
- green or warm green-gold only as a light completion accent
- keep the primary button in the established action color system

## 6. Consistency with prior steps

This completion step must feel like the natural end of the same learning journey as:
- Step 1 看一看
- Step 2 读一读
- Step 3 写一写
- Step 4 试一试

Consistency requirements:
- same overall page shell
- same header/progress system
- same primary button family
- same warm educational tone
- same spacing logic and rounded language

Distinctive difference:
- earlier steps are task screens
- this is a completion landing screen
- therefore this page may feel slightly more spacious and calm, but not disconnected from the rest of the product

## 7. Success criteria

The redesign is successful if:
- the child immediately understands which character has just been completed
- the page feels like a natural in-flow finish, not a popup interruption
- the character remains the visual focus
- the completion moment feels warm and satisfying without becoming loud
- the next action is obvious and singular
