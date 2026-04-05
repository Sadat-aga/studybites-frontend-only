# Studybites Login Page Behaviors

## Confirmed
- Language menu is hover-revealed on desktop using a popover container with opacity and visibility transitions.
- Password visibility uses an inline eye icon toggle.
- Submit button has disabled and loading states in the production bundle.
- Login form validates email format and requires a password of at least 8 characters before submit.
- Footer CTA routes toward account creation.

## Not cloned yet
- Real Apple and Google auth handoffs.
- Production forgot-password flow.
- Locale switching behavior.
- Drag-and-drop upload processing.
- Real sidebar/profile popovers inside the library app.
- File-detail activities are SSR-rendered as loading skeletons before client data hydrates.

## Screenshot note
- Live browser screenshot automation was unreliable in this environment, so the visual clone was built from the fetched production HTML/CSS and downloaded public assets instead.
- For the library page, the corrected credential that authenticated successfully against the live API was `Pasforbites`.
