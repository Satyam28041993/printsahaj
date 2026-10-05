# PR: Home: full-site website collage + Home nav item

Branch: `cursor/p011-website-collage-home-nav-e178`
Base: `main`

## Changes

### 1. Home Navigation Item
- Added **"Home"** as the first item in the main navigation (desktop and mobile)
- Only appears in the header; footer navigation unchanged (starts with Solutions)
- Active state (`aria-current="page"`) only on `/` route

### 2. Website Collage Redesign
Replaced the cropped website screenshots with **full-site captures** of three different client websites:

- **pgpltechprint.com** — Large back browser with full-page scrolling capture (auto-scrolls when motion is allowed, pauses on hover, respects `prefers-reduced-motion`)
- **ashokrajindustries.com** — Smaller browser, bottom-middle
- **tricil.in** — Tilted phone (mobile view), bottom-right

**Privacy:** All client logos replaced with PrintSahaj logo; phone numbers, emails, and personal data blurred.

### 3. New Collage Layout: `dvc--site`
- New `CollageLayout` type: `"site"`
- `ScrollingPage` component for full-page auto-scrolling in the back browser
- Phone device styling scaled for collages with `clamp()` for small containers
- Square stage at mobile width (< 640px); all three devices visible
- CSS transforms: phone tilted 5°, enhanced shadows, 3D effects on hover (desktop + motion)

### 4. Auto-Rotation Improvements
Updated auto-rotation timing to **6 seconds** (was 7s for showcase, 4.5s per step for help section):

✅ **Showcase section** ("Systems that work") — Rotates between product tabs every 6 seconds  
✅ **Help section** ("Where we can help you") — Rotates through feature steps within each service, then advances to next service

Both sections:
- Auto-advance only while in viewport (IntersectionObserver)
- Pause on hover, focus, and touch
- Respect `prefers-reduced-motion: reduce`
- Working pause/play button
- Keyboard accessible

### 5. Minor Adjustments
- Aivy callout width: `88cqw` → `100cqw` at mobile widths
- Removed old `WEB_A/B/C` crop definitions from `showcase.ts`
- New image caption: "Client websites · pgpltechprint · ashokraj · tricil"

## Screenshots

### Desktop Header (1440px) — BEFORE vs AFTER
| Before | After |
|--------|-------|
| ![Before](https://github.com/Satyam28041993/printsahaj/blob/cursor/p011-website-collage-home-nav-e178/docs/pr-shots/p011/before-1440-header.png?raw=true) | ![After](https://github.com/Satyam28041993/printsahaj/blob/cursor/p011-website-collage-home-nav-e178/docs/pr-shots/p011/after-1440-header.png?raw=true) |
| No Home item | **Home** as first nav item |

### Mobile Header + Menu (390px) — BEFORE vs AFTER
| Before | After |
|--------|-------|
| ![Before](https://github.com/Satyam28041993/printsahaj/blob/cursor/p011-website-collage-home-nav-e178/docs/pr-shots/p011/before-390-header-menu.png?raw=true) | ![After](https://github.com/Satyam28041993/printsahaj/blob/cursor/p011-website-collage-home-nav-e178/docs/pr-shots/p011/after-390-header-menu.png?raw=true) |
| No Home item | **Home** first in mobile menu |

### Website Collage Changes
**"Where we can help you" section** and **Showcase "Websites" tab** now show full-site captures instead of cropped panels. The back browser auto-scrolls the full page when motion is allowed.

*Note: High-resolution collage screenshots (> 400KB) not committed to avoid repo bloat. Test locally to see the full collage in action.*

## Testing
- ✅ Lint: clean
- ✅ Type-check: clean
- ✅ Production build: clean
- ✅ Auto-rotation: verified working in both showcase and help sections at 1440px and 390px
- ✅ Navigation: "Home" item highlighted only on `/`, other pages work correctly
- ✅ Keyboard accessibility: tab navigation and arrow keys work
- ✅ Reduced motion: auto-scrolling and auto-rotation disabled
- ✅ Responsive: tested at 390px, 1024px, 1280px, and 1440px

## Files Changed
- `web/content/site.ts` — Added Home nav link
- `web/src/components/landing/SiteFooter.tsx` — Filter out Home from footer
- `web/src/components/landing/DeviceCollage.tsx` — New `ScrollingPage`, `scroll` and `url` props
- `web/src/app/home.css` — `.dvc--site` layout, `.dvf-scroll` animation, timing updates
- `web/src/data/showcase.ts` — New `WEBSITES` collage, updated caption
- `web/src/components/landing/showcase/HomeShowcase.tsx` — `CYCLE_SECONDS: 6`
- `web/public/showcase/` — Added `web-pgpl-full.webp`, `web-ashokraj.webp`, `web-tricil-mobile.webp`
