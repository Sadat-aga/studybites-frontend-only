# Secondary Surfaces Specification

## Overview
- Target surfaces:
  - sidebar `Profile` panel
  - `Bites+` upgrade modal
  - bottom-left `New` launcher
  - `More options` popover
  - `New Subject` modal
  - `Rename Subject` modal
- Source: live authenticated `/en/library` inspected with Playwright MCP

## Confirmed Live Behaviors
- `Profile` opens a floating white card attached to the sidebar
- `Appearance` opens a compact side submenu with `System Preference`, `Dark`, and `Light`
- `Upgrade` opens a centered comparison modal with a blue gem header
- `New` expands into two pill actions:
  - `Upload Document`
  - `Subject`
- Card `More options` opens a small icon-driven menu:
  - `Share`
  - `Edit`
  - `Delete`
- `Subject` opens `New Subject`
- `Edit` opens `Rename Subject`

## Visual Notes
- Profile panel:
  - white rounded card
  - soft shadow
  - lavender-tinted top account panel
  - list rows separated by spacing and subtle dividers
  - dark mode version swaps the shell to blue-gray and the account panel to teal
- Upgrade modal:
  - large white outer shell
  - soft cyan inner panel
  - blue gem centered above heading
  - feature comparison rows with base vs Bites+ values
- New launcher:
  - round purple `+` button
  - open state swaps to a close icon
  - action buttons are white pills with small icons
- More options:
  - small white floating popover
  - each row has a pale icon tile
- New/Rename dialogs:
  - simple centered white form cards
  - single title input
  - purple gradient CTA
