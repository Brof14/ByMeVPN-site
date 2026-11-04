# ByMeVPN Website

Responsive Russian landing page for ByMeVPN. The primary action opens the official Telegram bot so visitors can review currently available connection options. The Android interface is a local-only visual demo; it never starts a VPN connection. Public Android downloads remain disabled until a verified release.

## Project files

- `index.html` — page structure, Russian copy, Android demo, release status, onboarding and FAQ.
- `styles.css` — design tokens, responsive layout, scene transitions, reduced-motion and focus styles.
- `app.js` — mobile navigation, four demo scenes, server-selection sheet and local UI state only.
- `docs/designs/bymevpn-product-story.md` — v3 product showcase design and acceptance criteria.
- `docs/AUDIT_2026-11-04.md` — refreshed audit, severity, changes and open verification limits.
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
