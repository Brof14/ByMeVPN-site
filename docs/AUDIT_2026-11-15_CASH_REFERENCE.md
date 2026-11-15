# ByMeVPN-site — Design reset after user review (2026-11-15)

## Why the previous version failed

The user's assessment of the preceding `main` was **1/100**. This is subjective feedback, not an objective benchmark, but it is the governing acceptance signal.

Inspected actual Chromium captures of the old site at 1440×900 and 390×844:
- A headline above 100 px dominated the desktop hero; the product preview began too low.
- In a vertical mobile viewport, the screenshot was rotated, truncated and cluttered with a watermark and tiny disclaimer laid over the image.
- Circular gradients, unrelated floating screens, index numerals and decorative captions competed with the only genuinely relevant element: the Android application UI.
- Repeated left-right alternating phone/text sections gave the site a template-like cadence.
- The overall look resembled another generic AI-generated SaaS landing page, despite correct technical tests.

## Reference review

References: https://cash.app/ (current official site, November 15 2026), https://www.landing.love/sites/cash/, https://maxibestof.one/websites/75956-cash-app.

Observations: The Cash App site uses a relatively compact headline and an immediately visible, wide, black stage with large, accessible UI imagery. Its content chapters prioritize a single benefit and give it a recognizable color field; product screenshots are composited into the layout rather than used as generic tilted-device placeholders.

The goal is to transfer **art-direction principles** only. No Cash App imagery, text, trademarks, 3D graphics or source code has been copied.

## Product-source verification

Android design reference PNGs were already imported from `Brof14/ByMeVPN-app/public/assets/aistudio`:
- `assets/app/home-on.png`: large connect button and status
- `assets/app/servers.png`: auto/server selection sheet
- `assets/app/account.png`: subscription and devices
- `assets/app/settings.png`: settings
- `assets/app/pricing.png`: tariff selection
- `assets/app/home-off.png`: offline connection state

These are **official project V2 design mockups**, not independently verified captures from a signed production release. Status, example servers and remaining days in these pictures must not be represented as live data.

The current bot source constants inspected on 2026-11-15 define 3-day trial, 15-day first-referral bonus, 2/5/10 device limits, base monthly rates 89/79/69/59 RUB and device additions +0/+20/+40 RUB. Terms include 1/4/8/15 paid months. The final checkout in the bot is authoritative.

## Changes in this iteration

- Full markup replacement, not a recolor of the previous design.
- A smaller, calmer editorial headline and a full-width dark media stage placed **within the first desktop viewport**.
- One dominant app screen, with a subordinate peek at server selection. No gratuitous orbit rings or giant watermark text.
- A five-state gallery directly inside the hero: connection, server selection, account, settings, pricing. Screen heading, image, alt text and ARIA state change together.
- Mobile-first reconstruction of the hero: central readable app screenshot, all gallery controls visible, information about demo status placed **below** rather than over the screen.
- Original product-specific chapters with blue server imagery, light subscription scene, full-width dark tariff list, mint devices section and three-step onboarding.
- Concrete copy replacing unsupported marketing slogans.
- Correctly disclosed static tariff math and bot-based onboarding.
- Improved accessibility: native details FAQ, keyboard-usable buttons, Escape to close menu, focus-visible states, reduced-motion.
- Local font assets and image files; no external JS analytics or tracking code.

## QA and release conditions

Run GitHub Actions checks:
- Python contracts (links, source assets, terms, product claims, accessibility, SEO)
- JavaScript syntax
- Chromium at 320×740, 390×844, 768×1024, 1440×900, 1920×1080
- Assert first product stage appears before fold, top of device is not clipped, images load, tab states work, total prices recalculate accurately, mobile menu/FAQ open & close, page has no horizontal scroll or JavaScript errors
- Save section screenshots plus desktop and mobile full-page captures, inspect actual outputs before merge

Not complete/verified by this static site: public APK distribution, live VPN tunnel, checkout success, Lighthouse Core Web Vitals, independent screen-reader audit or conversion uplift. No legitimate "100/100" certification can be inferred from frontend CI alone.
