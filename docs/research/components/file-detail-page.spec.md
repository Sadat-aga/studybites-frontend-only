# File Detail Page Specification

## Overview
- Target file: `src/components/studybites-file-page.tsx`
- Interaction model: authenticated file dashboard with click-through study actions and secondary sidebar flows
- Source: live authenticated `/en/library/files/6260097` inspected with Playwright MCP

## Confirmed Structure
- Shared workspace shell:
  - frosted left sidebar
  - nested subject/file row
  - bottom-left `New` launcher
  - top-right streak pill
- Content header:
  - `Back`
  - large slug title `pride-and-prejudice-jane-austen,1`
- Main split layout:
  - left activity/document column
  - right progress/share rail

## Confirmed Live Content
- Title: `pride-and-prejudice-jane-austen,1`
- Learning Activities:
  - `MCQs` / `40 Questions` / `Practice`
  - `Flashcards` / `30 Flashcards` / `Memorize`
  - `Summaries` / `Recap`
  - `Mind Maps` / `Coming Soon`
- Document row:
  - `Document`
  - `pride-and-prejudice-jane-austen,1`
  - `515 Pages`
- Progress rail:
  - `Track Your Progress!`
  - `MCQs` / `23%`
  - `Flashcards` / `40%`
- Share card:
  - `Study Smarter, Together!`
  - `Share your set with friends`
  - `Share`

## Visual Notes
- Activity cards are compact white tiles with strong bottom CTA bars
- Card tones:
  - indigo for MCQs
  - blue for Flashcards
  - pink for Summaries
  - pale disabled gray for Mind Maps
- Right rail is narrower and more decorative than the earlier mock version
- The document row is a slim horizontal card, not a chunky content block

## Responsive Behavior
- Mobile uses a distinct authenticated header with menu on the left, centered slug, and overflow action on the right
- Mobile places the progress/share rail above the activity stack instead of keeping it as a desktop sidebar
- Desktop keeps the frosted rail visible and places progress/share in a compact right-side column
- Dark mode turns the full page into a navy / blue-gray workspace while preserving the same content order
