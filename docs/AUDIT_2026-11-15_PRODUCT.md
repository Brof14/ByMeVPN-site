# 2026-11-15 — ByMeVPN Product Website Audit

## Scope and source of truth

- Original site: Brof14/ByMeVPN-site, `main` at `19733a6e` (bright cobalt version).
- Android repository: Brof14/ByMeVPN-app; **production-target** Jetpack Compose in `app/src/main/kotlin/com/example/bymevpn/`.
- Android design sources: `public/assets/aistudio/` — V2 PNG reference screenshots (not guaranteed to match the current shipped app or prove a connection).
- Subscription source: Brof14/ByMeVPN_bot `constants.py` and README.
- Design reference: https://cash.app/ — direct 2026-11-15 web research and visual references; principles, not copied assets.
- Published domain: https://bymevpn-site.duckdns.org/ (separate live-domain QA needed).

## Findings in previous ByMeVPN site

1. **Brand mismatch, critical for first impression:** bright cobalt #1769ED used as the dominant commercial color while Android UI is dark #090F1D / #121C2B with a mint #69D3BC CTA and a blue-to-cyan-to-mint shield.
2. **Invented phone interfaces:** handcrafted HTML/CSS smartphone screen differed materially from the existing Android V2 screen assets: wrong center connect button, status/contents, server selector presentation and nav.
3. **Generic slogans:** "Интернет, который твой", "Меньше настроек. Больше жизни" and similar captions used space without explaining product features.
4. **Weak product presentation:** despite the marketing claim "приложение", only a single fake UI model was displayed repeatedly. There was no coherent gallery of connection, server selection, account and settings screenshots.
5. **Visual excess:** colored orbits, floating labels and decorative stat blocks competed with actual screens, contrary to the product reference Cash App which lets screens/typography dominate.
6. **Potentially misleading claims:** proof of actual Android release, VPN routing, server availability, account entitlement and auto-renewal cannot be inferred from a static mock.

## App UI findings

`app/src/main/kotlin/.../theme/Color.kt`:
- BgCanvas #090F1D, BgSurface #121C2B
- BrandMint #69D3BC, BrandMintAccent #66C7BE
- BrandBlue #468FF0, SkyBlue #53BFCF, blue-cyan-mint shield gradient
- TextPrimary #EEF4F4

`public/assets/aistudio/IMPLEMENTATION_SPEC_RU_036f502b.md` confirms 16 PNG design concepts. The current website reuses the repo's home off/on, servers, account, settings and pricing concepts, explicitly labeled *design references*. Their example days, Germany nodes and statuses are not used as live data.

README of Android repo warns of pending release/API, signing, VPN-tunnel network, billing and Google Sign-In validations. The site must not offer unverified production binaries.

## Implemented changes

1. **Cash App-like art direction:** mint first screen, black product type, oversized phone preview; contrast sections in black/white/mint and strong single-action blocks.
2. Hero presents two actual Android design PNGs inside minimal physical frames instead of SVG/HTML fictional UI.
3. New interactive gallery for five real project design screens: off/on, server selection, account, settings; switching is local-only, semantic and screen-reader announced.
4. Separate large product chapters for server selection, subscription controls and settings with the exact Android repo PNGs.
5. Marketing copy prioritizes clear actions instead of interchangeable claims: "VPN. Одна кнопка.", "Сервер выбирается здесь.", "Подписка под рукой."
6. Trial/price content demoted to supporting sections instead of overshadowing the app. CTA still routes to official Telegram bot until signed public app is independently confirmed.
7. Full tariff price math for 2/5/10 devices; price/period totals consistent with bot source on date of inspection. Never imply "bonus months" are free when all included months are charged.
8. New keyboard-accessible gallery, mobile menu, FAQ via native details, focus ring, reduced motion.
9. No third-party fonts/scripts/tracking, client-side payment or simulated VPN connectivity.

## Release checklist

- Python structural contract suite and JS syntax check.
- Chromium visual captures at five resolutions: 320x740, 390x844, 768x1024, 1440x900 and 1920x1080.
- Verify all local app images load, gallery buttons change correct source and aria state, tariff selector yields 316→396→476 RUB on 3+1-month terms, FAQ and mobile menu work, no horizontal overflow or JS errors.
- Validate that full screenshot captures use adequate line heights and realistic mobile responsive layouts.
- GitHub Pages deployment run completes.
- Actual production domain, Android release, tunnel operations, billing and user conversion require separate external QA.

## Score caveat

The site cannot be factually called "best website of the year" or "100/100" without objective benchmarks, external design review, accessibility performance and user research. A passing browser suite confirms only the scenarios it checks.
