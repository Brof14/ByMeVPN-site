# ByMeVPN — public website

A Russian, responsive product page for ByMeVPN. The redesign pairs warm paper and restrained green accents with the Android project's dark interface. It uses original ByMeVPN assets and local Inter font files.

## Product information

- The page shows five Android V2 design mockups. Their server names, connection states and subscription details are examples, not proof of a public app release or a working VPN tunnel.
- The Telegram bot is the entry point for instructions, trial access and checkout: <https://t.me/ByMeVPN_bot?start=src_website>.
- Pricing is a static snapshot dated 2026-11-15: 89 / 79 / 69 / 59 ₽ monthly equivalents for terms of 1 / 4 / 8 / 15 months, with a surcharge of 20 ₽ per month for five devices and 40 ₽ per month for ten. Every month in a selected term is prepaid. Verify the current price, eligibility and renewal terms in the bot before purchase.
- A 3-day trial and a 15-day referral bonus are described as available under their bot eligibility conditions.

## Implementation

Static HTML, CSS and JavaScript. No external runtime requests, trackers, payment handling or VPN tunnel are part of this site.

- `index.html` — content, metadata, navigation and local product screens.
- `styles.css`, `tokens.css`, `base.css` — responsive page design and accessible states.
- `app.js` — mobile navigation, screen gallery and local tariff calculation.
- `tests/test_site.py` — markup, links, claims, images, pricing and security checks.
- `tests/visual-qa.mjs` — browser checks and screenshot evidence at 320, 390, 768, 1440 and 1920 pixels.

To run the existing checks:

```sh
python -m unittest discover -s tests -v
node --check app.js
npm ci
npm run test:browser
```

The browser checks cover the page UI. They do not validate VPN routing, the Android release, live payment terms or user conversion.
