# ByMeVPN — public website

Standalone, responsive, product-led landing page for ByMeVPN. Uses a clean editorial introduction and a high-contrast application presentation inspired by the **design principles** of [Cash App](https://cash.app/). This is an original ByMeVPN design, **not** a copy of Cash App's branding, assets or exact markup.

## Product presentation

- The home hero is a genuine V2 ByMeVPN Android design screenshot staged large in a black product display. The gallery switches between five ByMeVPN design screens: connection, servers, account, settings and tariff selection.
- Other chapters explain server selection, subscription status, up to ten devices, pricing, onboarding and referrals. Headlines are concrete rather than abstract advertising slogans.
- Native ByMeVPN APK availability has **not** been established. The screenshots are *design references from the Android repository*, not independently validated released-app captures. Their example server geographies, expiry dates and VPN statuses are disclosed as illustrative.
- The actual VPN setup and purchase flow starts in the official Telegram bot: https://t.me/ByMeVPN_bot?start=src_website

## Pricing integrity

The 2026-11-15 snapshot of `Brof14/ByMeVPN_bot/constants.py` specifies:

- 3-day free trial; +15-day referral bonus after first start via personal link.
- 2 / 5 / 10 device tiers.
- 89 / 79 / 69 / 59 ₽ monthly equivalents for 1 / 3+1 / 6+2 / 12+3 month offers, with +20 ₽ per month for five devices and +40 ₽ per month for ten.
- All included months are charged: term lengths 1 / 4 / 8 / 15 months and full prepaid totals are shown separately.

These figures are a static snapshot, **not** a live checkout quote. Confirm current payment and automatic-renewal terms in the bot before purchasing.

## Implementation

Pure static HTML + CSS + JavaScript, local Inter font files, local project-origin images and no external runtime network dependencies or tracking scripts.

- `index.html` — semantic content, SEO and screen images.
- `styles.css` — brand system, mobile/desktop presentation, reduced motion.
- `app.js` — local screen switcher, accessible menu and pricing calculation.
- `tests/test_site.py` — claims, markup, pricing, image and security contracts.
- `tests/visual-qa.mjs` — Playwright Chromium test at 320/390/768/1440/1920 px; stores section and desktop/mobile full-page screenshots in CI.
- `docs/AUDIT_2026-11-15_REBUILD.md` — design baseline, research and limitations.

## Test

```sh
python3 -m unittest discover -s tests -v
node --check app.js
npm ci
npx playwright-core install chromium
npm run test:browser
```

CI tests frontend behavior and captures visual evidence. It does **not** validate server connectivity, actual app release quality, payment gateway behavior, Core Web Vitals or real user conversion. Those require independent production tests.
