const assets = [
  [
    "https://app.studybites.ai/_next/static/media/bito-full-logo.f59ddd55.svg",
    "public/images/studybites/bito-logo.svg",
  ],
  [
    "https://app.studybites.ai/_next/static/media/globe.327c24ce.svg",
    "public/images/studybites/globe.svg",
  ],
  [
    "https://app.studybites.ai/_next/static/media/arrow-down.6386bf75.svg",
    "public/images/studybites/arrow-down.svg",
  ],
  [
    "https://app.studybites.ai/_next/static/media/eye-open.7ac2da08.svg",
    "public/images/studybites/eye-open.svg",
  ],
  [
    "https://app.studybites.ai/_next/static/media/bito-sm.4d225c61.svg",
    "public/images/studybites/bito-sm.svg",
  ],
  [
    "https://app.studybites.ai/_next/static/media/app-qr-code.20105e3e.svg",
    "public/images/studybites/app-qr-code.svg",
  ],
  [
    "https://app.studybites.ai/_next/static/media/learning-experience-light.41d4d8a7.png",
    "public/images/studybites/learning-experience-light.png",
  ],
  [
    "https://app.studybites.ai/_next/static/media/bito-gift.df578d47.png",
    "public/images/studybites/bito-gift.png",
  ],
  ["https://app.studybites.ai/assets/logo/favicon.svg", "public/seo/favicon.svg"],
];

for (const [url, filePath] of assets) {
  console.log(`${url} -> ${filePath}`);
}
