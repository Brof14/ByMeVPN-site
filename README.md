# ByMeVPN Website

Responsive Russian marketing and onboarding site for ByMeVPN. The primary action opens the official Telegram bot. The Android product showcase is a local-only interactive preview; no VPN connection is started on the website and no public Android APK is advertised.

## Project files

- `index.html` — conversion-first hero, official Telegram onboarding, Android demo, release status, terms and FAQ.
- `styles.css` — design tokens, responsive layout, scene transitions, reduced-motion and focus styles.
- `app.js` — mobile navigation, four demo scenes, server-selection sheet and local UI state only.
- `docs/designs/bymevpn-product-story.md` — original v3 product-scene design decisions (historical reference).
- `docs/audits/site-audit-2026-11-04.md` — full v4 code audit, confirmed root CSS issue, applied fixes and pending QA.
- `docs/research/reference-audit-2026-11-02.md` — browser review of original and local reference sites.
- `tests/test_site.py` — dependency-free static contract checks.
- `outputs/bymevpn-v3/visual/` — browser screenshots, viewport report and motion recording.
- `.github/workflows/site-checks.yml` — pull-request and push checks.
- `CNAME` — existing custom domain configuration, unchanged.

## Local preview and checks

Run from the repository root:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

```powershell
py -m unittest discover -s tests -v
node --check app.js
```

## Product and release boundaries

- There is no public Android release. Internal debug builds are not public downloads; the Android download control stays disabled until an official release is verified. The header and hero Telegram buttons are active because they open the existing official bot, not an APK.
- The website demo only changes visible UI states. It does not connect to a VPN or make network calls.
- Server options, account access and terms can depend on the service response and account. The page does not invent server locations, prices, trials or network-performance claims.
- Telegram links are the real onboarding and support path. They are not presented as a substitute for downloading the unreleased Android application.
- This PR does not change the Android application, backend, bot, payments, VPN infrastructure, custom-domain configuration or deployment.
