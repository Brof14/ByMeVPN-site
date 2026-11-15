# ByMeVPN — Product website

An original, app-led, editorial VPN site using the **actual ByMeVPN Android V2 design reference screens**, not a fabricated UI. Core design direction: the product-dominant staging and typographic discipline seen on [Cash App](https://cash.app/). Cash App logos, photographs, screen assets and copy are **not** reused.

## Visual identity

- Palette from Android `AppColors`: mint **#69D3BC**, deep canvas **#090F1D**, surface **#121C2B**; sky/electric blue is secondary.
- A light editorial intro followed by one full-bleed dark product theater with the oversized app image.
- Distinct chapters: mint app gallery, blue server composition, graphite account chapter, compact white editorial pricing table, blue onboarding, mint referral billboard.
- No random feature cards, floating stats, testimonials, fabricated review scores or technical guarantees.

## Source attribution and limitations

Screens in `assets/app/` are copied from `Brof14/ByMeVPN-app/public/assets/aistudio/` and are **V2 design mockups**, not externally validated captures of a released build. Values printed inside the screenshots (such as connected status, server location, remaining days and auto-renewal) are example content. The site repeatedly discloses this and does not establish a VPN connection.

The Android repository README explicitly says production signing, API, payment and tunnel lifecycle checks are still in development. Consequently this marketing site directs visitors to the official bot for the currently supported connection flow rather than offering an unverifiable APK. Native-app screenshots are a concept preview, not a download promise.

Bot constants inspected on 2026-11-15:
- Free trial 3 days; first bot-start referral bonus 15 days.
- 2/5/10 device limits.
- Monthly equivalents for 2 devices: 89 / 79 / 69 / 59 RUB for 1 / 3+1 / 6+2 / 12+3-month plans.
- +20 RUB per month for 5 devices; +40 RUB per month for 10.
- All displayed months are paid; upfront totals (including extra months) appear in the pricing table.
- The bot is the authority for real-time eligibility, renewals and checkout quotes.

The primary action throughout the site is `https://t.me/ByMeVPN_bot?start=src_website`.

## Technical stack

Plain static HTML, CSS and JavaScript. No libraries for runtime UI, remote font or analytics tracker, no account credentials, cookies, fake checkout or VPN networking in the page.

- `index.html` — semantic product story, local screenshots and all external URLs.
- `styles.css` — editorial layout with device-specific breakpoints (320–1920 px) and reduced-motion fallback.
- `app.js` — screen selector, mobile menu and transparent billing calculator.
- `tests/test_site.py` — semantic/claims/accessibility/source-data contracts.
- `tests/visual-qa.mjs` — Chromium screenshots, interaction and responsiveness QA.
- `docs/AUDIT_2026-11-15_THEATER.md` — rationale and verification scope.

## Verify

```sh
python3 -m unittest discover -s tests -v
node --check app.js
npm ci
npx playwright-core install chromium
npm run test:browser
```

Screenshot artifacts are attached to the **Site checks** GitHub Actions run. A passing suite proves only the tested frontend interactions; independent production-domain, Lighthouse/Core Web Vitals, screen-reader, app distribution, real VPN and billing testing remain separate.
