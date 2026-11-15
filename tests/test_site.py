"""Contracts for ByMeVPN's public, product-led website."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")
BOT = "https://t.me/ByMeVPN_bot?start=src_website"
SUPPORT = "https://t.me/ByMeVPNSupportBot"


class DOM(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.images, self.buttons, self.headings, self.sections = [], [], [], [], [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"): self.ids.append(a["id"])
        if tag == "a": self.links.append(a)
        if tag == "img": self.images.append(a)
        if tag == "button": self.buttons.append(a)
        if tag in ("h1", "h2", "h3"): self.headings.append(tag)
        if tag == "section": self.sections.append(a)


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dom = DOM()
        cls.dom.feed(HTML)

    def test_unique_ids_and_one_h1(self):
        self.assertEqual(len(self.dom.ids), len(set(self.dom.ids)))
        self.assertEqual(self.dom.headings.count("h1"), 1)

    def test_navigation_and_anchor_targets(self):
        for link in self.dom.links:
            href = link.get("href", "")
            self.assertTrue(href and href != "#", link)
            self.assertFalse(href.lower().startswith("javascript:"))
            if href.startswith("#"):
                self.assertIn(href[1:], self.dom.ids)
        for name in ("main", "application", "servers", "account", "pricing", "devices", "how", "questions"):
            self.assertIn(name, self.dom.ids)
        self.assertGreaterEqual(len(self.dom.sections), 9)

    def test_local_assets_and_image_alt(self):
        for img in self.dom.images:
            self.assertIn("alt", img)
        paths = re.findall(r'(?:src|href)="(assets/[^"]+)"', HTML)
        paths += re.findall(r'url\(["\']?(assets/[^"\')]+)', CSS)
        for asset in paths:
            self.assertTrue((ROOT / asset).is_file(), asset)
        for name in ("home-off", "home-on", "servers", "account", "settings", "pricing"):
            self.assertTrue((ROOT / f"assets/app/{name}.png").exists())
        self.assertNotIn("fonts.googleapis", HTML + CSS)

    def test_secure_external_links(self):
        for link in self.dom.links:
            if link.get("target") == "_blank":
                rel = set(link.get("rel", "").split())
                self.assertIn("noopener", rel)
                self.assertIn("noreferrer", rel)

    def test_primary_conversion(self):
        self.assertGreaterEqual(HTML.count(BOT), 8)
        self.assertIn("Начать бесплатно", HTML)
        self.assertIn("Получить 3 дня бесплатно", HTML)
        self.assertIn(SUPPORT, HTML)
        self.assertNotIn("href=\"downloads/", HTML)

    def test_screens_from_real_project(self):
        self.assertIn('id="demo-stage"', HTML)
        self.assertIn('id="demo-screen"', HTML)
        self.assertIn('role="status"', HTML)
        self.assertIn("дизайн-проекта", HTML)
        self.assertIn("сайт не подключает VPN", HTML)
        self.assertEqual(len([b for b in self.dom.buttons if b.get("data-screen")]), 5)
        for key, filename in (("on", "home-on"), ("servers", "servers"),
                              ("account", "account"), ("settings", "settings"), ("pricing", "pricing")):
            self.assertIn(f'data-screen="{key}"', HTML)
            self.assertIn(f'assets/app/{filename}.png', JS)
        self.assertIn("VPN не подключается", JS)

    def test_tariff_math_is_honest(self):
        for source in (
            "const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15})",
            "const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59})",
            "const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40})",
        ):
            self.assertIn(source, JS)
        self.assertIn("Каждый месяц указанного срока", HTML)
        self.assertIn("условия автопродления", HTML)
        for tier in (2, 5, 10):
            self.assertIn(f'data-tier="{tier}"', HTML)
        for months in (1, 3, 6, 12):
            self.assertIn(f'data-months="{months}"', HTML)

    def test_no_unverified_product_claims(self):
        for phrase in ("100% аноним", "99.99%", "10 Гбит/с", "публичный APK", "no-logs",
                       "10000 пользователей", "гарантированно работает"):
            self.assertNotIn(phrase.lower(), HTML.lower())
        self.assertIn("Публичный подписанный релиз приложения пока не подтверждён", HTML)
        for api in ("fetch(", "XMLHttpRequest", "new WebSocket(", "sendBeacon("):
            self.assertNotIn(api, JS)

    def test_accessibility(self):
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('aria-controls="mobile-nav"', HTML)
        self.assertIn('aria-expanded="false"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn('aria-live="polite"', HTML)
        self.assertIn('event.key === "Escape"', JS)
        self.assertIn(':focus-visible', CSS)
        self.assertIn('prefers-reduced-motion', CSS)
        self.assertFalse(any("disabled" in b for b in self.dom.buttons))

    def test_seo(self):
        for tag in ('<html lang="ru">', 'rel="canonical"', 'property="og:image"',
                    '"@type":"WebSite"', '<title>ByMeVPN'):
            self.assertIn(tag, HTML)

    def test_not_an_external_network_client(self):
        self.assertNotIn("<iframe", HTML)
        self.assertNotIn("https://fonts.", CSS + HTML)
        self.assertNotIn("document.cookie", JS)
        self.assertNotIn("localStorage", JS)


if __name__ == "__main__":
    unittest.main()
