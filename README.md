# ByMeVPN — public website

Product-first, static and responsive ByMeVPN landing page. Built as plain HTML, CSS and JavaScript without a frontend framework, trackers, remote fonts or browser network APIs.

## Production user journey

- The primary CTA opens the official Telegram bot: https://t.me/ByMeVPN_bot?start=src_website.
- Eligible visitors can activate the documented three-day trial without a card.
- The interactive phone is a **visual demo only** and cannot establish a VPN connection.
- Prices are copied from bot source \`constants.py\`, not fetched from a payments API. The final confirmation and payment terms are those displayed in the live bot. Every included month is charged, including the additional months shown in 3+1, 6+2 and 12+3 offers.
- Public Android APK availability has not been verified; no download link is advertised. The site offers compatible-client instructions in the bot.
- Support link: https://t.me/ByMeVPNSupportBot.

## Code

- \`index.html\`: semantic structure, copy, marketing information, SSR-friendly markup and local illustrative product screens.
- \`styles.css\`: design tokens, native responsive CSS, device mockups, accessible states and reduced-motion behavior.
- \`app.js\`: mobile navigation, offline demo state machine and tariff calculations.
- \`tests/test_site.py\`: dependency-free structural, security and claim checks.
- \`tests/visual-qa.mjs\`: Chromium tests across 320, 390, 768, 1440 and 1920 pixels, local screenshot evidence.
- \`docs/AUDIT_2026-11-14.md\`: evidence-based audit and release criteria.

## QA

\`\`\`sh
python3 -m unittest discover -s tests -v
node --check app.js
npm ci
npx playwright-core install chromium
npm run test:browser
\`\`\`

GitHub Actions runs the same checks and uploads browser screenshots for PR review.

## Scope and safety

The site intentionally does not implement billing, subscriptions, account login, VPN tunnels or administrative workflows. No unconfirmed server geographies, public applications, guaranteed speeds, independent no-logs audits, uptime statistics or customer counts are claimed.

Before changing the published monthly prices, verify the current production bot and backend. Confirm signed public application releases, update manifests and supported platforms before enabling direct downloads.
