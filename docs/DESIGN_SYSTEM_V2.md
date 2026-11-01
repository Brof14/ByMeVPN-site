# ByMeVPN — design system 2.0

## Scope and provenance

This document defines a proposed website design system grounded in the current Android app's `app/src/main/kotlin/com/example/bymevpn/theme/Color.kt`, the supplied six mobile screenshots, the current bot's `constants.py`, and the existing website. It is **not** proof that any runtime feature or API endpoint is deployed.

Brand: **ByMeVPN**  
Slogan: **Скорость. Свобода. Простота.**  
Voice: calm, concise, technically credible. No fake urgency or unsupported claims.

## Canonical tokens

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--canvas` | `#090F1D` |
| Surface | `--surface` | `#121C2B` |
| Elevated surface | `--surface-alt` | `#172536` |
| Border | `--border` | `#263647` |
| Primary accent | `--mint` | `#69D3BC` |
| Main text | `--white` | `#EEF4F4` |
| Secondary text | `--secondary` | `#9CACBD` |
| Muted text | `--muted` | `#7D94A8` |
| Brand blue (illustrations only) | `--blue` | `#468FF0` |

The reference Android screen uses this same palette. Saturated cyan/green (#00ff9d) is not a general-purpose UI accent.

## Component grammar

- **Type:** Inter with system fallback. Restrained weights 400–750, fluid headings, readable body copy.
- **Space:** grid based on 4/8px, width 1240px, page gutters 44px desktop / 18–20px mobile.
- **Radius:** 12–15px for controls, 20–24px for cards, 30px for prominent showcase.
- **Borders:** 1px low-contrast surface separators; no floating cards without a purpose.
- **Primary CTA:** quiet mint gradient on deep blue canvas; one primary CTA per decision point.
- **Secondary CTA:** outlined, subdued, subordinate to primary.
- **Motion:** only hover affordances / transitions; honor `prefers-reduced-motion`.
- **Touch targets:** buttons around 55px high; mobile navigation has keyboard, Escape, and click-outside support.
- **Images:** original ByMeVPN app symbol reused from mobile repo. The browser-facing image is temporarily loaded from GitHub's raw content; **production should vend a versioned local copy** before final release.
- **Product displays:** CSS-based conceptual demo, labeled clearly. Never call a mockup a real VPN connection.

## Mobile application screen inventory (concepts)

1. Welcome
2. Sign up
3. Sign in
4. Home: no active plan
5. Home: disconnected
6. Home: connecting
7. Home: connected
8. Server selection
9. Free trial
10. Pricing
11. Account
12. Settings
13. Devices
14. Subscription management
15. Referral program

Each prototype is an independently rendered PNG. The conceptual shield redraw in local prototypes is **not** the approved production logo and must be replaced with the actual brand asset if those images are used in marketing.

## Conversion and product rules

1. **One hero promise:** VPN, which simply works.
2. **First action:** access three days free without a card, subject to trial eligibility.
3. **No hidden opt-in:** a free trial should not silently enable recurring payment.
4. **Price accuracy:** 2/5/10-device tiers and monthly equivalent must match the canonical billing backend; static website values require verification at checkout.
5. **No invented social proof** or bandwidth claims.
6. **No faux download buttons** for unreleased platforms.
7. **No bare VPN jargon** in onboarding; avoid VLESS/Reality where not necessary.
8. **Clear trial-to-paid boundary:** activation, expiry, paid plan selection must be explicit.

## Suggested instrumentation

- `landing_view`, `primary_cta_click`, `plan_cta_click`, `trial_cta_click`, `faq_open`, `platform_click`.
- Conversion measurements require server-side attribution and consent-compliant analytics; **they are not implemented by this static site**.
- Report bot start → successful trial → first connection → first paid purchase → second payment; do not equate link clicks with actual conversion.

## Competitive reference translation

The following matrix is an editorial analysis of the public websites, **not** a measured exhaustive cross-device UX audit.

| Reference | Transferable idea | Don't import |
|---|---|---|
| [Raycast](https://www.raycast.com/) | High-impact opening and product-led storytelling | Red brand palette and keyboard-specific framing |
| [Cash App](https://cash.app/) | Single-action clarity and confident brand presence | Finance-specific language or unsupported benefit claims |
| [NordVPN](https://nordvpn.com/) | Explain privacy product via end-user utility and transparent tier comparison | Overcomplicated upsell grids |
| [Revolut](https://www.revolut.com/) | Strong mobile product imagery and decisive typography | Banking claims or unnecessary product modules |
| [Linear](https://linear.app/) | Deep dark surfaces, disciplined spacing, thoughtful transitions | Developer-only navigation language |
| [Figma](https://www.figma.com/) | Concrete demonstration of workflow and collaborative product | Excessive interactive hero complexity |
| [Notion](https://www.notion.com/) | Low-friction explanations | Large generic icon-card blocks |
| [Vercel](https://vercel.com/) | Clear hierarchy, technical confidence | Overly technical marketing |
| [Uber](https://www.uber.com/) | One action immediately apparent | High-friction forms on entry |
| [Coinbase](https://www.coinbase.com/) | Trust signals and obvious conversion | Unsupported performance promises |
| [Calm](https://www.calm.com/) | Emotional calm and low cognitive load | Wellness imagery |
| [Headspace](https://www.headspace.com/) | Friendly value explanation | Cartoon/illustration vocabulary incompatible with ByMeVPN |

## Product and visual review checklist

- Brand symbol identical across website/app; no faux redraw in final product screenshots.
- RU/EN translations checked end-to-end in app (not implemented for website).
- Device tier and expiry returned from backend; never placeholder successes.
- Connected status tied to real VPN engine and traffic validation.
- Layout tested at 320px, 375px, 768px, 1280px and 1920px.
- Keyboard, screen reader, contrast, zoom and reduced-motion checked manually.
- Mobile no-plan state has no accessible VPN server selector.
- No paid-trial (1 ₽) claims unless the backend and product are explicitly changed.
