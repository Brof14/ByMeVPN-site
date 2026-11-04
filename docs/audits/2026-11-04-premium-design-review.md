# ByMeVPN — UX/UI audit & marketing design direction
Date: 2026-11-04
Status: product-design concept and additive site improvement, NOT an Android release.

## Scope
- Six supplied Android screenshots (signup, login, settings, account, connected state x2).
- Current Android V2 theme, home, trial, pricing and repository source.
- ByMeVPN Telegram bot pricing constants and reward constants.
- Current production website source + its documented release constraints.
- First-party reference home pages: Raycast, Linear, Figma, Notion, Vercel, Revolut, NordVPN, Uber, Coinbase, Cash App, Calm, Headspace.

Not covered by runtime validation: deployed bot trial settings, live API plan catalog, store release, VPN tunnel, payment backend, true device limits and real server availability.

## Editorial current UI score (out of 10; no user research performed)

| Dimension | Score | Diagnosis |
|---|---:|---|
| Brand/mark | 8.5 | Strong unique shield and professional chromatic edge |
| Colors | 8.5 | Deep navy + blue/mint works; some panels flatten contrast |
| Typography | 7.0 | Wide variance in sizes; repeated subdued copy is difficult to scan |
| Spacing/composition | 7.0 | Some screens have unused vertical space or dense subsections |
| Navigation | 7.5 | Three visible tabs; account details still nested and repetitive |
| Login/signup | 6.5 | Large decorative top and heavy legacy Telegram migration card |
| VPN primary action | 8.0 | Unique mark and central action; status explanation can be shorter |
| Pricing/monetization clarity | 6.5 | Device tiers, periods, bonus duration and price labels require careful hierarchy |
| Device/account states | 6.0 | Screenshot shows unknown plan and missing device cap from server |
| Marketing screenshot quality | 6.0 | Original captures show statusbar clutter and account errors |
| Overall editorial score | **7.2** | Good identity, not yet a consistent polished launch story |

This is expert judgment, not an objective measurement of conversion or a claim of 10/10.

## Design changes
1. Use approved logo and exact Android palette: canvas #090F1D, surface #121C2B, mint #69D3BC, text #EEF4F4.
2. One priority per screen. First viewport should clearly answer: what is this, what is happening, what is the next action?
3. Improve connected/off/connecting visual differentiation, without suggesting a browser demo is a real tunnel.
4. Simplify forms: consistent fields, useful password cues, compact migration route.
5. Keep Russian sites direct toggle enabled in proposed screenshots, matching current source UI.
6. Stop showing unsupported server ping, countries, speed and synthetic totals in commercial material.
7. Make subscription/device information source-driven and distinguish unknown state from zero. Examples in mockups must be labeled examples.
8. Pricing: total charge and duration matter more than an artificially low 30-day equivalent. The app fetches the actual catalog from backend; do not hardcode in native checkout.
9. Use explicit dates or no example customer profile data. Avoid fake testimonials or popularity claims.
10. Website conversion should target available onboarding via @ByMeVPNbot, not a fake Android APK.

## External reference audit — transferable principles
These are homepage/source observations, not pixel-perfect multiscreen audits.

| Reference | Useful principle | How applied |
|---|---|---|
| https://www.raycast.com/ | Strong primary claim, large native product scenes, restraint in accents | Bigger product hierarchy; no endless feature grids |
| https://cash.app/ | Bold clarity of primary action and recognizably singular product imagery | Central connect action |
| https://nordvpn.com/ | Clear app use case, device support, pricing clarity and FAQ | Contextual trial/onboarding and transparent access |
| https://www.revolut.com/ | Editorial mobile visual storytelling and confidence | Hero/product photo composition |
| https://linear.app/ | Dark surfaces, detailed UI demonstration and motion restraint | Navy design with low-noise UI |
| https://www.figma.com/ | Real product illustrations teach the feature | App previews rather than decoration |
| https://www.notion.com/ | Lightweight introductory language and clear navigation | Plain Russian descriptions |
| https://vercel.com/ | High information density and precise hierarchy | Technical trust without jargon overload |
| https://www.uber.com/ | Obvious first action without unnecessary reading | Primary Telegram CTA |
| https://www.coinbase.com/ | Strong control and trust framing | Account/subscription controls |
| https://www.calm.com/ | Quiet visual confidence | Muted gradients, readable type |
| https://www.headspace.com/ | Progressively disclosed information | FAQ and accessible support |

## Assets created for owner delivery
Seventeen high-resolution standalone PNG screens (1350×2940), a 3220×3480 comprehensive overview and a 2560×1440 hero marketing composition have been generated in the current session. Their delivery is separate from GitHub; this repository patch adds lightweight HTML/CSS gallery previews using the *existing local approved shield asset*. It does **not** claim the binary PNG deliverables have been added to the GitHub repository.

## Website implementation and constraints
- Preserve current high-quality four-state scroll product demo.
- Add a visual tour for core flows (connection, plans, settings, account).
- Use the local approved brand asset; no external CDN dependency for gallery.
- Make the real, currently available @ByMeVPNbot action prominent. Do not replace it with a download link.
- Retain the truthful disabled Android download until a vetted public release exists.
- Keep original safe trial and plan-price constraints in production website tests, as deployed runtime remains unverified.
- Keep site no-network browser demo and reduced-motion support.
- Do not mutate bot, app, billing or VPN infrastructure for this marketing-only patch.

## Launch acceptance criteria
1. Re-run static tests and browser regression across viewport sizes.
2. Check mobile gallery horizontal scroll and keyboard behavior.
3. Verify product mockup captions remain explicit and truthful.
4. Review contrast, alt tags and external target link protection.
5. Confirm available onboarding and trial terms in live bot before new commercial campaign.
6. Do not report actual conversion uplift, Lighthouse scores or 10/10 without measurement.
