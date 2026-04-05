# Studybites Login Page Technical Notes

- Framework: Next.js Pages Router on the source site
- Font delivery: Cairo via preloaded WOFF2 files
- Styling approach: Tailwind utility classes plus CSS custom properties
- Inputs/forms: react-hook-form + zod resolver in the production bundle
- Social auth hooks present: Apple sign-in, Google script
- Clone choices:
  - Next.js 16 App Router
  - local Cairo font files for stable offline builds
  - mocked auth context instead of real backend/session handling
