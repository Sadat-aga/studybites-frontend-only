# AuthShell Specification

## Overview
- Target file: `src/components/studybites-auth-shell.tsx`
- Interaction model: static with hover popover
- Source: login-page

## Structure
- 80px-tall nav
- Left-aligned logo
- Right-aligned locale menu button and outlined CTA
- Background blur centered behind card
- Absolute overlay container that holds the auth card

## Assets
- `public/images/studybites/bito-logo.svg`
- `public/images/studybites/globe.svg`
- `public/images/studybites/arrow-down.svg`

## Responsive Behavior
- Maintains full-width nav
- Card remains centered with `max-w-lg`
- Locale popover is desktop-oriented; current clone keeps it visible on hover-capable layouts
