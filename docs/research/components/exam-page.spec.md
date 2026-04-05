# Exam Page Specification

## Overview
- Target file: `src/components/studybites-exam-page.tsx`
- Interaction model: question-answering surface
- Source: live authenticated tab at `/en/library/study-set/.../folder/6260097/exam?isFileView`

## Confirmed Live Content
- Title: `Pride and Prejudice Literary Analysis`
- Progress: `0 / 40`
- Utilities: `Translate`, `Hint`
- Prompt: `What is the primary focus of 'Pride and Prejudice'?`
- Difficulty chip: `Easy`
- Instruction: `Choose the correct answer:`
- Choices:
  - `Political intrigue and warfare`
  - `Religious dogma and philosophy`
  - `Domestic life and human condition`
  - `Scientific discovery and progress`
- Bottom actions:
  - `Ask Bito!`
  - `Source`
  - `Skip`

## Visual Notes
- Soft cool-gray page background with subtle radial wash
- Mobile uses a compact centered single-column layout
- Desktop adds a left AI assistant panel with greeting text and a question input
- Top row has close button, centered title/progress, settings button
- Progress indicator is a row of rounded pills with first segment active
- Answer cards are white rounded panels with soft shadow and circular radio markers
- Bottom action icons sit in rounded square tiles above labels
