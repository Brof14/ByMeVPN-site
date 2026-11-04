# ByMeVPN — Creative & engineering execution brief

## Product
Create a distinctive, cinematic, frontend-only marketing website for ByMeVPN. Its primary purpose is to showcase the **Android VPN app** and lead to a **verified, signed APK download when a public production release exists**. The site must not become a dashboard or require a new backend. Telegram is only a secondary support/legacy channel.

## Original references
- Raycast (https://www.raycast.com/): visual discipline, depth, typography, cinematic introduction.
- Revolut (https://www.revolut.com/): large confident product compositions and pacing.
- Cash App (https://cash.app/): app-first marketing, device-centered scenes.
- NordVPN (https://nordvpn.com/): clarity of VPN benefits and device/download information.
- Secondary: Linear, Vercel, Figma, Notion, Coinbase, Uber, Calm and Headspace.

Local technical references, if reachable: Raycast http://localhost:3004/ and Revolut http://localhost:3002/revolut . Original sites take visual precedence. Do not copy competitor logos or proprietary assets.

## Source of truth
- Website: https://github.com/Brof14/ByMeVPN-site
- Android: https://github.com/Brof14/ByMeVPN-app
- Bot (reference only): https://github.com/Brof14/ByMeVPN_bot

Use existing app visuals, brand and confirmed functionality. Do not invent servers, privacy promises, prices, or download availability.

## Art direction
Deep midnight blue, controlled aqua highlights, original flowing light-line signature, strong readable Cyrillic, deliberate negative space and meaningful asymmetric staging. Avoid huge mint slabs, empty scroll screens, generic 3-card SaaS sections, fake screenshots, and Telegram-first calls to action. Visual hierarchy and actual browser renders, not self-declared ratings, determine quality.

## Animation architecture
Animate intentional transitions (hero entrance, layered hero objects, interactive demo states, subtle reveals). The interactive demo must remain local-only and explicitly marked as a demonstration. User controls must not conflict with scroll observers or timers. Always respect reduced-motion. Content must remain visible without JavaScript; do not gate visibility through opacity:0 before an observer runs.

## Current code and review strategy
This branch is a first implementation, **not an approved final visual design**. The hero and phone staging, connected/off interactive state, two asymmetric feature panels, Android-release state, FAQ and footer are implemented. The production APK is not available. A genuine signed production APK, version and checksum must be verified before enabling downloads.

## Must-do QA
Run `python -m unittest discover -s tests -v`, `node --check app.js`, `npm ci`, `npm run test:browser`. Review the uploaded browser screenshots visually on desktop 1440x900, tablet 768x1024 and mobile 390x844. Verify all text/sections are visible, screenshots are legible, no overflow, no JS errors, the demo responds and reduced-motion works. Critique the work as an art director; iterate until approved. Use Hallmark and the Elephant-Goldfish Model if those plugins are actually available in your local agent, and never claim a skill ran without invoking it.

Do not merge into main or deploy until the user visually approves the PR and checks pass.
