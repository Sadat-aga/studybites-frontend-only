# Studybites Clone Export

This folder is a self-contained export of the current Studybites-style app from the main workspace.

## What is included

- Next.js 16 app source in `src/`
- assets in `public/`
- research/spec files in `docs/`
- helper capture/download scripts in `scripts/`
- package/config files needed to run the app standalone

## Run locally

```bash
npm install
npm run dev
```

Or for a production build:

```bash
npm install
npm run build
npm run start
```

## Main routes

- `/authenticate`
- `/library`
- `/library/files/6260097`
- `/library/files/6260097/summary`
- `/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam`
- `/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/learn`

## Suggested next step

To publish this as its own repo later:

1. Copy this folder out of the template workspace.
2. Initialize a fresh git repo inside it.
3. Add your new GitHub remote.
4. Push normally.

## Notes

- This export keeps the current mock auth and mock study data.
- The original workspace remains unchanged so you can reuse it for future app clones.
