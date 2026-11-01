# ByMeVPN Website

Premium, responsive, static product website for ByMeVPN. The source follows the Android V2 visual tokens and uses a transparent pricing/trial explanation. No SPA framework or production API dependency is required to render the marketing page.

## Files

- `index.html` — semantic landing page, Russian marketing copy, pricing, onboarding, FAQs, support.
- `styles.css` — responsive design system with reduced-motion and keyboard-focus support.
- `app.js` — accessible mobile navigation and automatic copyright year.
- `docs/DESIGN_SYSTEM_V2.md` — source-based design direction and mobile screen concepts.
- `docs/AUDIT_2026-11-01.md` — issues, assumptions and production release gates.
- `tests/test_site.py` — dependency-free structural and marketing integrity checks.
- `.github/workflows/site-checks.yml` — checks on push/PR.
- `CNAME` — existing custom-domain configuration, intentionally unchanged.

## Local preview

Run from the repository root:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

Run static checks:

```powershell
python -m unittest discover -s tests -v
node --check app.js
```

Check the result at mobile/desktop widths (320, 375, 768, 1280, 1920px) before merging. These checks do not replace visual browser QA, Lighthouse or real subscription testing.

## Source-of-truth and caveats

- App UI tokens: `Brof14/ByMeVPN-app` → `app/src/main/kotlin/com/example/bymevpn/theme/Color.kt`.
- Tariff snapshot: `Brof14/ByMeVPN_bot` → `constants.py` (2-device prices 89 / 316 / 552 / 885 ₽ total for 1, 4, 8, 15 months of access respectively).
- Trial: current Android V2 screen explicitly offers **3 days free without a card**. However, legacy bot constants also contain an older **1 ₽ intro-trial** model. **Verify the production bot / API before publishing trial copy**.
- Prices and eligibility are confirmed during checkout; the marketing site is not a billing authority.
- Website illustrates the mobile interface with CSS and loads the approved shield art from the public Android repo. For production, copy image assets locally and review caching/license/availability.
- Never present Windows/Linux or Android distributions as publicly released until download flows have been verified.
- No unverified anonymity, logging or connection-speed promises.

## Deployment

Create a Pull Request, review the content and GitHub Actions, then merge following owner approval. Domain routing remains governed by the existing `CNAME` and GitHub Pages settings. This branch does not change payment, backend, VPN networking, account data, DNS or production deployment.
