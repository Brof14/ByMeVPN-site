# ByMeVPN Website

Public website for ByMeVPN. A product-led, mobile-first marketing experience built as **static HTML, CSS and JavaScript**. No web login, payments or VPN tunnel are implemented.

## Design direction

The main reference is [Cash App](https://cash.app/): a single saturated brand field, oversized type, large actual product previews, distinct scroll chapters and one main action per section. ByMeVPN uses its **own** mint / blue shield palette and the UI of its Android app, not Cash App's colors, assets or trademarks.

The product preview images are imported from:
`Brof14/ByMeVPN-app/public/assets/aistudio/`

- `04_home_off_86729ec7.png` → `assets/app/home-off.png`
- `05_home_on_d4ef8e5c.png` → `assets/app/home-on.png`
- `06_servers_4c67c8c0.png` → `assets/app/servers.png`
- `08_pricing_8fe863b0.png` → `assets/app/pricing.png`
- `10_account_active_66413e96.png` → `assets/app/account.png`
- `11_settings_1428e5bc.png` → `assets/app/settings.png`

**These are official repository design concepts, not independently verified production screenshots.** They may include example connection statuses, servers, subscription dates, auto-renew statuses and pricing. The site marks these values as illustrative. The marketing website's screen selector changes local images only; it does not connect a VPN or access user accounts.

## Confirmed product data

The price selector is a static copy of `Brof14/ByMeVPN_bot/constants.py` as inspected on 2026-11-15:

- Trial period: 3 days, with no card according to the documented bot experience.
- Invitation: +15 days when a referred new user starts the bot.
- Device limits: 2 / 5 / 10.
- Per-month base equivalents: 89 / 79 / 69 / 59 RUB for the 1 / 3+1 / 6+2 / 12+3 period names.
- Extra per included month: +20 RUB for 5 devices, +40 RUB for 10.
- Actual paid access: 1 / 4 / 8 / 15 months. All included months are charged and **the entire total is shown**.

Rates and eligibility are not queried from a live payment API. The official bot is the source of truth before purchase. The public signed Android app is not independently verified as released; users are directed to compatible client instructions from the bot.

## Files

- `index.html`: semantic marketing content and accurate product showcases.
- `styles.css`: mint + graphite app identity, responsive layouts, clear focus/reduced motion.
- `app.js`: mobile menu, local screenshot selector and transparent tariff calculator.
- `tests/test_site.py`: claims, accessibility, asset and pricing contracts.
- `tests/visual-qa.mjs`: Chromium verification at 320 / 390 / 768 / 1440 / 1920 px.
- `docs/AUDIT_2026-11-15_PRODUCT.md`: full audit, reference comparison, acceptance limits.

## Run QA

```bash
python3 -m unittest discover -s tests -v
node --check app.js
npm ci
npx playwright-core install chromium
npm run test:browser
```

CI uploads browser screenshots and a JSON QA report for each viewport. A passing test suite confirms the checked frontend contracts, not actual connection availability, privacy claims, conversion outcomes or live payment processing.
