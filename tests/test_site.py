"""Source contracts for the product-led ByMeVPN landing page."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")
BOT = "https://t.me/ByMeVPN_bot?start=src_website"


class DOM(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.anchors, self.images, self.buttons, self.headings, self.sections = [], [], [], [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"): self.ids.append(a["id"])
        if tag == "a": self.anchors.append(a)
        if tag == "img": self.images.append(a)
        if tag == "button": self.buttons.append(a)
        if tag in ("h1", "h2", "h3"): self.headings.append(tag)
        if tag == "section": self.sections.append(a)


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dom = DOM()
        cls.dom.feed(HTML)

    def test_single_h1_unique_ids(self):
        self.assertEqual(self.dom.headings.count("h1"), 1)
        self.assertEqual(len(self.dom.ids), len(set(self.dom.ids)))

    def test_semantic_navigation(self):
        for a in self.dom.anchors:
            href = a.get("href", "")
            self.assertTrue(href and href != "#", a)
            self.assertFalse(href.lower().startswith("javascript:"))
            if href.startswith("#"): self.assertIn(href[1:], self.dom.ids)
        for anchor in ("main", "product", "servers", "subscription", "pricing", "how", "friends", "questions"):
            self.assertIn(anchor, self.dom.ids)
        self.assertGreaterEqual(len(self.dom.sections), 9)

    def test_local_assets(self):
        for img in self.dom.images: self.assertIn("alt", img)
        paths = re.findall(r'(?:src|href)="(assets/[^"]+)"', HTML)
        paths += re.findall(r'url\(["\']?(assets/[^"\')]+)', CSS)
        for p in paths: self.assertTrue((ROOT / p).is_file(), p)
        for name in ("home-off", "home-on", "servers", "account", "settings", "pricing"):
            self.assertTrue((ROOT / f"assets/app/{name}.png").is_file(), name)
        self.assertNotIn("fonts.googleapis", HTML + CSS)

    def test_external_links_safe(self):
        for a in self.dom.anchors:
            if a.get("target") == "_blank":
                self.assertIn("noopener", a.get("rel", "").split())
                self.assertIn("noreferrer", a.get("rel", "").split())

    def test_primary_action(self):
        self.assertGreaterEqual(HTML.count(BOT), 7)
        self.assertIn("3 дня бесплатно", HTML)
        self.assertIn("Получить 3 дня бесплатно", HTML)
        self.assertIn("https://t.me/ByMeVPNSupportBot", HTML)

    def test_source_app_design_assets_and_disclosure(self):
        self.assertIn("дизайн-макеты", HTML.lower())
        self.assertIn("демонстрационные данные", HTML.lower())
        self.assertIn("Публичный подписанный релиз", HTML)
        self.assertIn("VPN на сайте не запускается", JS)
        self.assertIn("Дизайн-макеты V2", HTML)
        self.assertIn("id=\"demo-screen\"", HTML)
        self.assertIn("id=\"demo-live\"", HTML)
        self.assertIn("role=\"status\"", HTML)
        self.assertEqual(len([b for b in self.dom.buttons if b.get("data-screen")]), 6)
        for name in ("off", "on", "servers", "account", "settings", "pricing"):
            self.assertIn(f'data-screen="{name}"', HTML)
            self.assertIn(f'assets/app/{("home-" + name) if name in ("off", "on") else name}.png', JS)

    def test_trustworthy_pricing(self):
        self.assertIn("const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15})", JS)
        self.assertIn("const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59})", JS)
        self.assertIn("const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40})", JS)
        self.assertIn("Каждый месяц указанного срока, включая дополнительные месяцы", HTML)
        self.assertIn("автопродление", HTML)
        for tier in ("2", "5", "10"): self.assertIn(f'data-tier="{tier}"', HTML)
        for month in ("1", "3", "6", "12"): self.assertIn(f'data-months="{month}"', HTML)

    def test_no_fabricated_product_claims(self):
        for text in ("no-logs", "100% аноним", "99.99%", "10 Гбит/с", "10000 пользователей",
                     "скачать APK", "гарантировано", "подключение к реальному VPN"):
            self.assertNotIn(text.lower(), HTML.lower())
        self.assertNotIn("href=\"downloads/", HTML)
        for forbidden in ("fetch(", "new WebSocket(", "XMLHttpRequest", "sendBeacon("):
            self.assertNotIn(forbidden, JS)

    def test_accessible_and_motion(self):
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('aria-controls="mobile-nav"', HTML)
        self.assertIn('aria-expanded="false"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn("event.key === \"Escape\"", JS)
        self.assertIn(":focus-visible", CSS)
        self.assertIn("prefers-reduced-motion", CSS)
        self.assertFalse(any("disabled" in button for button in self.dom.buttons))

    def test_seo(self):
        for item in ('<html lang="ru">', 'rel="canonical"', 'property="og:image"',
                     '"@type":"WebSite"', '<title>ByMeVPN'):
            self.assertIn(item, HTML)


if __name__ == "__main__":
    unittest.main()
