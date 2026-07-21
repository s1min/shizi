# Wot Icon Unification Design

## Goal

Unify all functional icons in `shizi-frontend` on the existing `wot-design-uni` icon component (`wd-icon`) without changing page behavior or replacing semantic image assets such as avatars, logos, and learning illustrations.

## Decisions

- `wd-icon` is the only component used for functional icons in custom UI.
- Custom tabbar entries use wot icon names (`home`, `books`, `user`) and render through one `wd-icon` branch.
- Legacy UnoCSS icon classes, the unused iconfont stylesheet, and emoji/text glyphs used as controls or status indicators are removed from functional UI.
- Existing container classes, click handlers, labels, and visual colors remain unchanged; icon size is supplied explicitly in pixels or inherited where the surrounding typography already controls scale.
- Native tabbar image configuration remains as a platform fallback because native tabbar APIs cannot render Vue components; the active project strategy is the custom tabbar.

## Verification

- Search source for functional glyphs and legacy icon classes.
- Run `pnpm type-check` and `pnpm lint`.
- Run a production H5 build when dependencies/tooling permit.
