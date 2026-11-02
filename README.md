# ByMeVPN Website

Premium, responsive Russian product site for the ByMeVPN Android app. The Android interface is the main visual focus; its interactive states are a local-only demo and never start a VPN connection.

## Project files

- `index.html` — page structure, Russian copy, Android demo, release status, onboarding and FAQ.
- `styles.css` — design tokens, responsive layout, scene transitions, reduced-motion and focus styles.
- `app.js` — mobile navigation, four demo scenes, server-selection sheet and local UI state only.
- `docs/designs/bymevpn-product-story.md` — implemented v3 design decisions and acceptance criteria.
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

- There is no public Android release. Internal debug builds are not public downloads; both Android download controls stay disabled until an official release is verified.
- The website demo only changes visible UI states. It does not connect to a VPN or make network calls.
- Server options, account access and terms can depend on the service response and account. The page does not invent server locations, prices, trials or network-performance claims.
- Telegram links are reserved for the official bot and support; Telegram is not used as an Android download substitute.
- This PR does not change the Android application, backend, bot, payments, VPN infrastructure, custom-domain configuration or deployment.
