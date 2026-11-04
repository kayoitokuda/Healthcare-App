# v0.5.0 PWA implementation and QA

## Audit and implementation plan

Audit date: November 4, 2026.

- Repository: `kayoitokuda/Healthcare-App`, canonical v0.4.4 branch `v0.4.4-denial-next-steps`, initially at `d1ef5bc`.
- Vercel: `referral-navigator` uses Vite. Its latest inspected deployment was `READY` at `referral-navigator-9i3rnabub-kayoitokudas-projects.vercel.app`, built from `d1ef5bc`. The Vercel project has no production-target deployment attached; the alias is the public product domain.
- The GitHub default branch contains the original v0 prototype, so v0.5.0 is based on the deployed v0.4.4 branch.
- v0.4.4 already includes a responsive bottom navigation, mobile safe-area spacing, five language options, Supabase auth, email confirmation returning to the site origin, and referral data stored through the signed-in account flow.
- The HTML did not declare a PWA manifest or Apple web-app metadata. The declared favicon was Vercel's template icon. Existing Vercel builds are client-rendered Vite output.

Plan: create a separate v0.5.0 branch; add a standalone manifest and app icons; show a small install option when a native browser prompt is available, or offer menu instructions on Chromium/Android and iOS Safari; retain the existing mobile navigation and auth flow; register a network-only service worker; verify that the production build emits the PWA assets; publish a Vercel preview for review. No production promotion or merge is part of this change.

## Implementation

- Added `manifest.webmanifest` with standalone display, `/` scope/start URL, theme/background colors, and Android icon sizes.
- Added a shared Referral Navigator icon as SVG plus 192, 512, and Apple 180 pixel PNG assets. Updated the declared favicon and Apple mobile-web-app metadata.
- Added a five-language landing-page install option. It uses `beforeinstallprompt` when available; Chromium/Android gets browser-menu instructions as a fallback, and iOS Safari gets concise Add to Home Screen instructions. The option hides when already running standalone and can be dismissed for the current page view.
- Added `viewport-fit=cover` and a small safe-area allowance for the landing page. Existing standalone dashboard navigation, bottom inset, auth form, and Supabase session behavior remain in place.
- Registered a minimal service worker in production only. It does not create Cache Storage entries or cache the app shell, API requests, auth responses, or referral data. Offline use is intentionally unsupported; installation requires a network connection for app startup and data access.
- Supabase auth remains on its existing browser session flow. Email confirmation redirects to the app's origin; no credential, token, or patient data is written by PWA code.

## QA record

Local production-build status: passed. `npm run build` completed (`tsc -b` and Vite production bundle) on the initial implementation and the install-guidance fallback. Asset checks confirmed the manifest parses, both manifest icons have their declared 192 × 192 and 512 × 512 dimensions, the Apple touch icon is 180 × 180, `dist/sw.js` is emitted, and built HTML references the manifest. `git diff --check` passed.

Vercel preview status: passed at `https://referral-navigator-eznuofjid-kayoitokudas-projects.vercel.app/`, deployment `dpl_8wj9CmeJ6gPuYaAccGGLvdYvU1eH`, source commit `ebaa195`. The deployment is `READY` and remains a preview.

- Preview root returned HTTP 200. The manifest, service worker, 192/512 PNG icons, and Apple touch icon all returned HTTP 200. Vercel served the manifest as `application/manifest+json` and `sw.js` as JavaScript.
- The preview accessibility tree showed the landing install option in Chromium when `beforeinstallprompt` was unavailable. Selecting “How to add” displayed browser-menu instructions.
- Selecting Japanese updated the install heading, supporting copy, button label, dismissal label, and instructions to Japanese.
- The built worker contains no Cache Storage use and forwards GET requests to the network. Offline launch is not supported.

Remaining manual device QA: physical iOS Safari Add to Home Screen, Android Chrome native install sheet, installed standalone launch/safe areas, sign-in/signup keyboard fit, email-confirmation return, and authenticated Supabase persistence/account isolation. These require real devices and a configured test account. Do not use real patient data.
