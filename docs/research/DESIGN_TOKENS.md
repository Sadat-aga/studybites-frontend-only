# Studybites Login Page Design Tokens

Source page: `https://app.studybites.ai/en/authenticate`

## Typography
- Primary font: Cairo
- Heading weight: 700
- Label/input weight: 600
- Nav/button weight: 700

## Core Colors
- Page background: `hsl(var(--bg-page))` where `--bg-page` resolves to `gray-50`
- Card background: `hsl(var(--bg-default))` where `--bg-default` resolves to white
- Primary brand: `hsl(var(--primary))` where `--primary` resolves to `240 89% 66%`
- Default text: `hsl(var(--text-default))` where `--text-default` resolves to `222 47% 11%`
- Secondary text: `hsl(var(--text-secondary))` where `--text-secondary` resolves to `215 19% 35%`
- Border secondary: `hsl(var(--border-secondary))` where `--border-secondary` resolves to `214 32% 91%`

## Shape
- Form card radius: `1rem` via `rounded-2xl`
- Primary CTA radius: `0.75rem` via `rounded-xl`
- Social button radius: `4px`

## Effects
- Card shadow: soft elevated surface; cloned as `0 18px 50px rgb(96 97 240 / 0.14)`
- Background glow: blurred radial blend behind the card (`gradient-blur`)
- Transition cadence: mostly `duration-200`, card entrance `duration-1000 ease-in`
