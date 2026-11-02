# EGM review — ByMeVPN redesign

Date: 2026-11-01. One bounded independent pass against the EGM feature-spec and implementation-readiness standards. Three reviewers examined design, codebase facts and implementation readiness. The reviewed specification is `docs/designs/bymevpn-experience.md`.

## Findings and disposition

| ID | Finding | Disposition |
| --- | --- | --- |
| D1 | A live-looking timer can imply an actual VPN session. | Fixed: the demo excludes the timer and all changing network/server values. |
| D2 | Purchase copy implied a confirmed renewal cancellation path. | Fixed: copy asks users to inspect amount, period and the cancellation method shown by the selected offer; it does not promise cancellation availability. |
| D3 | 320 px and 375 px were absent from the viewport set despite known overflow. | Fixed: both widths and no-overflow criteria are explicit. |
| D4 | The demo’s state change lacked a screen-reader announcement. | Fixed: both button labels, status text and polite live announcement are specified. |
| D5 | Alternatives, risks and mitigations were missing from the spec. | Fixed: concise rejected alternatives and mitigations are recorded. |
| R1 | Most section copy and FAQ answers were not final. | Fixed: final Russian copy and six question/answer pairs are specified. |
| R2 | Anchor destinations were ambiguous, particularly `#benefits`. | Fixed: all seven existing fragment IDs map to explicit targets; resolution is a completion check. |
| R3 | The product screen states and timer treatment were underspecified. | Fixed: initial/toggled UI content is exact, with unsupported dynamic fields excluded. |
| R4 | Asset sources, output paths, formats and failure behavior were missing. | Fixed: source/output paths and fallbacks are listed for logo, fonts and generated hero texture. |
| R5 | Target files, phases and per-phase acceptance checks were missing. | Fixed: HTML/CSS/JS/test targets and phase gates are listed. |
| R6 | Viewport QA had no concrete pass criteria. | Fixed: overflow, clipping, menu, desktop fold, keyboard, FAQ, reduced motion, assets, links and console criteria are defined. |
| C1 | Calling auto-renew code a working worker and referring to a definite cancellation flow overstates unverifiable production behavior; the reviewer could not verify one bot source link. | Fixed: spec now describes repository evidence as unverified, makes the selected bot offer the authority, and avoids claiming a cancellation path exists. |
| C2 | The spec did not clearly preserve the original `#benefits` anchor or specify tests/targets. | Fixed with explicit anchor mapping, scoped file list, and behavioral checks. |

No finding was left contested. The review did not verify production pricing, trial, cancellation, app release or VPN egress; the website copy avoids making those claims.

## Pass 2 — product-story v3

**Date:** 2026-11-02. Three focused reviewers checked the redesigned direction against Android source facts, product boundaries and implementation readiness. The new implementation brief is `docs/designs/bymevpn-product-story.md`; the previous section remains as the record of PR #2.

| Finding | Disposition |
| --- | --- |
| The first frame gave oversized copy more weight than the app. | Accepted: reduced the headline scale and moved the device earlier. Chromium measurements show a 340 px device centered in the 1440×900 first frame, with the release status and CTA visible. |
| The mock’s server label and bottom navigation did not match the Android source. | Fixed: home starts at «Сервер не выбран», automatic selection appears only in the server sheet, and tabs read «Главная / Настройки / Аккаунт». |
| A prototype variant used a selector that could not match its root element. | Fixed: the studio variant styles its root directly. Variant C remains rejected because it obscures the screen. |
| The demo needed distinct server-sheet navigation, keyboard behavior and reduced-motion criteria. | Fixed: the sheet opens/closes, Escape returns focus, explicit actions update the live region, scroll-driven changes remain quiet, and reduced motion removes transitions. |
| Release language must distinguish an unpublished debug artifact from a public Android release. | Fixed: the page states that no public Android release exists; both download controls are disabled and no Telegram or debug APK link stands in for a download. |
| Acceptance evidence and viewport coverage were not tied to the implementation. | Fixed: contract tests, a nine-size Chromium matrix, state screenshots and a motion recording are saved with the branch. |

No finding is contested. The visual QA confirmed no horizontal overflow, browser errors or external requests at the checked viewports. It does not claim that the Android tunnel connects or that a public release exists.
