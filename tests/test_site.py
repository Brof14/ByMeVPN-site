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

    def test_trial_terms_match_current_mobile_experience(self):
        self.assertIn("3 дня бесплатно", HTML)
        self.assertIn("Без привязки банковской карты", HTML)
        self.assertIn("пробный период сам по себе не создаёт платную подписку", HTML.lower())

    def test_no_unverified_marketing_claims(self):
        for claim in ("10 Гбит/с", "No-logs", "полностью анонимный", "15+ стран", "100% аноним"):
            self.assertNotIn(claim.lower(), HTML.lower())

    def test_all_plan_totals_match_bot_snapshot(self):
        for total in ("89 ₽ всего", "316 ₽ всего", "552 ₽ всего", "885 ₽ всего"):
            self.assertIn(total, HTML)
        self.assertIn("Актуальная цена и доступность тарифа подтверждаются в боте", HTML)

    def test_accessible_navigation(self):
        self.assertRegex(HTML, r'aria-expanded="false"')
        self.assertRegex(HTML, r'aria-controls="site-nav"')
        self.assertIn('id="site-nav"', HTML)
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('event.key === "Escape"', JS)

    def test_responsiveness_and_motion(self):
        self.assertIn("@media(max-width:540px)", CSS)
        self.assertIn("prefers-reduced-motion:reduce", CSS)
        self.assertIn(":focus-visible", CSS)

    def test_no_placeholder_links(self):
        for link in self.doc.links:
            self.assertNotEqual(link.get("href"), "#")
            self.assertFalse(link.get("href", "").startswith("javascript:"))

if __name__ == "__main__":
    unittest.main()
