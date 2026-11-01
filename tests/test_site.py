"""Dependency-free static contract checks for the ByMeVPN marketing site."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[dict[str, str]] = []
        self.images: list[dict[str, str]] = []
        self.buttons: list[dict[str, str]] = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d:
            self.ids.append(d["id"])
        if tag == "a":
            self.links.append(d)
        if tag == "img":
            self.images.append(d)
        if tag == "button":
            self.buttons.append(d)


class SiteContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = SiteParser()
        cls.doc.feed(HTML)

    def test_no_duplicate_ids(self):
        self.assertEqual(len(self.doc.ids), len(set(self.doc.ids)))

    def test_internal_targets_resolve(self):
        for link in self.doc.links:
            if link.get("href", "").startswith("#"):
                self.assertIn(link["href"][1:], self.doc.ids)

    def test_external_blank_tabs_are_safe(self):
        for link in self.doc.links:
            if link.get("target") == "_blank":
                rel = set(link.get("rel", "").split())
                self.assertTrue({"noopener", "noreferrer"}.issubset(rel), link)

    def test_images_have_alt(self):
        self.assertTrue(self.doc.images)
        for image in self.doc.images:
            self.assertIn("alt", image)

    def test_no_unverified_trial_or_price_promises(self):
        for claim in ("3 дня бесплатно", "без привязки банковской карты", "89 ₽", "316 ₽", "552 ₽", "885 ₽"):
            self.assertNotIn(claim.lower(), HTML.lower())
        self.assertNotIn('class="plan"', HTML)

    def test_no_unverified_marketing_claims(self):
        for claim in ("10 Гбит/с", "No-logs", "полностью анонимный", "15+ стран", "100% аноним"):
            self.assertNotIn(claim.lower(), HTML.lower())

    def test_checkout_disclosure_points_to_current_offer(self):
        self.assertIn("полную сумму", HTML.lower())
        self.assertIn("автопродление", HTML.lower())
        self.assertIn("указанный способ отмены", HTML.lower())

    def test_demo_has_two_disclosed_states_and_no_network_code(self):
        self.assertIn('id="demo-screen" data-state="off"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn("Показать VPN: запущен", HTML)
        self.assertIn('aria-live="polite"', HTML)
        self.assertIn("VPN выключен", HTML)
        self.assertIn("VPN запущен", JS)
        self.assertIn("Реальное подключение не запускалось", HTML)
        self.assertIn("dataset.state", JS)
        for api in ("fetch(", "XMLHttpRequest", "WebSocket("):
            self.assertNotIn(api, JS)

    def test_assets_are_local_and_present(self):
        self.assertNotIn("fonts.googleapis.com", HTML + CSS)
        self.assertNotIn("raw.githubusercontent.com", HTML + CSS)
        paths = re.findall(r'(?:src|href)="(assets/[^\"]+)"', HTML)
        paths += re.findall(r'url\(["\']?(assets/[^"\')]+)', CSS)
        self.assertTrue(paths)
        for relative in paths:
            with self.subTest(path=relative):
                self.assertTrue((ROOT / relative).is_file(), relative)
        self.assertIn("logo-fallback", CSS + JS)

    def test_accessible_navigation(self):
        self.assertRegex(HTML, r'aria-expanded="false"')
        self.assertRegex(HTML, r'aria-controls="site-nav"')
        self.assertIn('id="site-nav"', HTML)
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('event.key === "Escape"', JS)

    def test_responsiveness_and_motion(self):
        for fragment in ("@media (max-width: 350px)", "@media (max-width: 540px)", "@media (max-width: 820px)", "@media (prefers-reduced-motion: reduce)", ":focus-visible", "overflow-x: clip"):
            self.assertIn(fragment, CSS)
        for width in (320, 360, 375, 390, 768, 1280, 1440, 1920):
            self.assertIn(str(width), (ROOT / "docs/designs/bymevpn-experience.md").read_text(encoding="utf-8"))

    def test_no_placeholder_links(self):
        for link in self.doc.links:
            self.assertNotEqual(link.get("href"), "#")
            self.assertFalse(link.get("href", "").startswith("javascript:"))

if __name__ == "__main__":
    unittest.main()
