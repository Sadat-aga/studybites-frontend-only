# Library Page Specification

## Overview
- Target file: `src/components/studybites-library-page.tsx`
- Interaction model: authenticated document workspace with click-driven menus, sidebar drawers, and modal overlays
- Source: live authenticated `/en/library` inspected with Playwright MCP

## DOM Structure
- Desktop:
  - Frosted left rail with logo, nav items, active subject row, and bottom-left `New` launcher
  - Main canvas with a top-right streak pill
  - Single floating study-set card with stacked-folder tabs behind it
- Mobile:
  - Compact top bar with hamburger and language switch
  - Hidden off-canvas sidebar
  - Centered study-set card and streak pill near the upper right

## Confirmed Live Content
- Sidebar:
  - `Library`
  - `Profile`
  - `Upgrade`
  - `Pride and Prejudice Literary Analysis`
- Main card:
  - `Pride and Prejudice Literary Analysis`
- Utility:
  - `New`
  - streak value `0`

## Confirmed Interactions
- `Profile` opens an in-place profile/settings panel in the sidebar
- `Appearance` inside `Profile` opens a secondary picker with:
  - `System Preference`
  - `Dark`
  - `Light`
- `Upgrade` opens a centered `Bites+` modal
- `New` opens a small menu with:
  - `Upload Document`
  - `Subject`
- `Subject` opens a `New Subject` modal
- Card `More options` opens:
  - `Share`
  - `Edit`
  - `Delete`
- `Edit` opens a `Rename Subject` modal
- Clicking the study-set card navigates to `/en/library/files/6260097`

## Visual Notes
- Background is a very soft off-white / cool-gray wash
- Sidebar is narrow, airy, and frosted rather than heavy or card-like
- Active `Library` item uses a pale lavender highlight
- Study-set card is compact with rounded corners, subtle depth, and faint tab layers behind the card top edge
- Desktop layout leaves a large amount of negative space to the right of the card
- Dark mode replaces the page wash with a navy-on-indigo gradient and converts cards to deep blue-gray surfaces
- The dark sidebar keeps the same structure, but the active state becomes a stronger indigo bar

## Responsive Behavior
- Desktop keeps the left rail visible and anchors `New` at the lower left
- Tablet keeps the sidebar hidden behind the hamburger and still centers the study-set card
- Mobile hides the rail behind a hamburger menu and keeps the card centered with the streak pill floating above/right
