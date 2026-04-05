# LoginForm Specification

## Overview
- Target file: `src/components/login-form.tsx`
- Interaction model: form-submission
- Source: login-page

## DOM Structure
- Auth card wrapper with `rounded-2xl`, white surface, centered layout
- Title row: `Sign in`
- Social row: Apple button, Google button
- Divider row: `Or`
- Email field block with label + bordered rounded input
- Password field block with label + bordered rounded input + eye icon toggle
- Inline forgot-password link
- Full-width primary submit button
- Footer row with signup CTA

## Computed Style Notes
- Title: `text-lg sm:text-xl font-bold`
- Labels: `text-sm font-semibold`
- Inputs: `rounded-xl px-2 py-3 border border-primary/50`
- Submit button: `bg-primary text-white rounded-xl px-4 py-3 font-bold`

## States & Behaviors
- Email validation: required + valid email shape
- Password validation: required + min 8 chars
- Password visibility toggle
- Submit loading/disabled state
- Error message below fields / submit area

## Assets
- `public/images/studybites/eye-open.svg`

## Text Content
- Sign in
- Or
- Email
- Password
- Forgot Password?
- Sign in
- Don't have an account?
- Create an account
