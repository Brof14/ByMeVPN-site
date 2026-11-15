# ByMeVPN — Product Theater: redesign audit (15 November 2026)

## Evaluation baseline

Previous live `main` before this branch: `6c247040`.
Visual evidence: Chromium screenshots of desktop 1440 and mobile 390, first hero and product showcase.

The previous version was usable but not comparable to Cash App for art direction:
- mint background with a standard split heading/CTA and two overlapping tilted phones;
- screenshot content was mostly too small to read; the screenshot panels looked like a predictable template;
- adjacent product chapters repeated the same "short text / phone screenshot" composition;
- pricing was more transparent but visually separate from the overarching brand story;
- the wordmark and Android palette were present, but used mostly as surface colors rather than a recognizable system.

## Reference: current Cash App

Checked https://cash.app/ on 2026-11-15 and design references from landing.love/MaxiBestOf. Relevant principles:
1. Type establishes hierarchy before media; the first action is obvious.
2. Large, memorable scenes per product capability rather than a continuous parade of rounded cards.
3. Contrast between near-black, bold brand color and off-white backgrounds.
4. Product imagery is generously scaled; branded media doesn't need a heavy text overlay.
5. Animations are deliberate and do not conceal essential information.

**Do not copy:** proprietary Cash App images, screenshots, exact structure, copy, custom Cash Sans font, green brand or app icon.

## Source-backed ByMeVPN identity

Android Compose `AppColors`: canvas `#090F1D`, surface `#121C2B`, mint `#69D3BC`, electric blue `#468FF0`. Device screens are sourced from `Brof14/ByMeVPN-app/public/assets/aistudio` and committed as local PNGs.
These are V2 **design mockups**, not proof of a distributed, signed Android app or a live VPN session. Example subscribed days, German node list, on-state and auto-renew values in screenshots are deliberately marked as demonstrations.

Bot `constants.py` provides the pricing/eligibility reference: 3-day trial, +15 days for first referral start, limits 2/5/10, 89/79/69/59 RUB monthly equivalents, +20/+40 RUB/month for extra slots, prepaid terms of 1/4/8/15 months. Real bot checkout remains the source of truth.

## Concrete design changes

- Editorial near-white hero with short factual heading, a single primary bot CTA and a **large, high-contrast dark product theater** rather than two ornamental phones on a mint background.
- App image staged above the fold with its actual brand bar and power control visible. Product screenshots are original ByMeVPN project assets.
- A contrasting pale-mint product chapter with six selectable screens. Keyboard-accessible buttons update a live image, its alt text and ARIA state; CSS animation respects reduced motion.
- Server section: light-blue large screenshot crop with the automatic-selection interface. Account section: dark immersive vignette showing subscription state and controls.
- Four prepaid tariffs displayed as **editorial full-width rows** with interactive 2/5/10 device selector, not four identical SaaS cards.
- Onboarding: blue section with exactly three steps; referral: vivid mint billboard +15 days. FAQ: narrow readable details accordion.
- Mobile 320–500 layouts specifically tuned; hero device is cropped from its lower edge only, not through the Android top bar.
- Local fonts and media, no API network calls, no trackers, no fake App Store buttons.
- SEO/canonical/OG/schema.org, semantic H1, keyboard focus, Escape nav and reduced motion.

## QA acceptance and limitations

Python source tests and `node --check`; Chromium 320x740, 390x844, 768x1024, 1440x900, 1920x1080; test CTA, navigation, gallery image/aria, tariff totals, FAQ, JS errors, overflow, lazy images and reduced motion. Store section and full-page screenshot artifacts and manually inspect.

Remaining exclusions before calling the experience 100/100:
- independent Core Web Vitals/Lighthouse against the actual custom domain;
- expert screen-reader/keyboard accessibility audit;
- signed native Android distribution and real VPN connectivity validation;
- real bot payment/subscription integration and user conversion testing;
- human qualitative design acceptance.

This is not a measured claim of objective parity or superiority to Cash App; the aim is comparable visual discipline through an original ByMeVPN product identity.
