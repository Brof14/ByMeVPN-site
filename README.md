# ByMeVPN — Website

A light, product-led Russian marketing website for ByMeVPN, designed around a distinct cobalt-blue brand language, bold typography, vivid product scenes and clear commercial flow.

Design references: https://platipomiru.com/ (clean light fintech content, clear offers and onboarding) and https://cash.app/ (bold color blocking, visual scale and product-first storytelling). These are inspiration only: no competitor assets, logos or proprietary content are reused.

## Customer journey

- Main CTA: https://t.me/ByMeVPN_bot?start=src_website
- Three-day free trial without a card, subject to the bot's eligibility rules.
- Interactive device tiers (2 / 5 / 10 devices) and prepaid periods of 1 / 4 / 8 / 15 months, based on the documented bot tariff tables.
- The static site lists monthly equivalent and the **full upfront total**, including all additional months. Production payment terms are determined by the official bot.
- +15 days for an invited new user when they first start the bot via a referral link.
- The visual app demo does not install or connect a VPN. Own Android, Windows and iOS apps are not advertised as production downloads without release verification.

## Files

- index.html — semantic landing, copy, original visual/product illustrations, canonical/OG metadata.
- styles.css — desktop/mobile brand design, responsive compositions, accessible states, reduced motion.
- app.js — accessible menu, visual demo state machine, device tier calculator; no external client API calls.
- tests/test_site.py — static HTML and product contract checks.
- tests/visual-qa.mjs — Chromium QA and screenshots for 320, 390, 768, 1440 and 1920px viewports.
- docs/AUDIT_2026-11-15.md — review of previous issues, design decisions and limitations.

## QA

Run the following from the repository root:

    python3 -m unittest discover -s tests -v
    node --check app.js
    npm ci
    npx playwright-core install chromium
    npm run test:browser

GitHub Actions runs this suite and attaches viewport screenshots to the workflow result.

## Scope and safety

No external fonts, trackers, fake user counts, invented security audits, guaranteed performance numbers, public APK downloads, direct billing or real VPN tunnel are embedded in the page. The price table is a snapshot of source constants and is not a live payment quote. The bot remains the source of current checkout details.
