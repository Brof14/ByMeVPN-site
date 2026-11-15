"""ByMeVPN public site: semantic, product-claim and conversion contracts."""
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")
BOT = "https://t.me/ByMeVPN_bot?start=src_website"
SUPPORT = "https://t.me/ByMeVPNSupportBot"


class Parse(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.images = []
        self.buttons = []
        self.headings = []
        self.sections = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"): self.ids.append(a["id"])
        if tag == "a": self.links.append(a)
        if tag == "img": self.images.append(a)
        if tag == "button": self.buttons.append(a)
        if tag in ("h1", "h2", "h3"): self.headings.append(tag)
        if tag == "section": self.sections.append(a)


class SiteContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = Parse()
        cls.page.feed(HTML)

    def test_unique_ids(self):
        self.assertEqual(len(self.page.ids), len(set(self.page.ids)))

    def test_anchor_targets(self):
        for a in self.page.links:
            href = a.get("href", "")
            self.assertTrue(href and href != "#", a)
            self.assertFalse(href.lower().startswith("javascript:"))
            if href.startswith("#"):
                self.assertIn(href[1:], self.page.ids, href)

    def test_assets_exist_and_images_have_alt(self):
        for img in self.page.images:
            self.assertIn("alt", img)
        assets = re.findall(r'(?:src|href)="(assets/[^"]+)"', HTML)
        assets += re.findall(r'url\(["\']?(assets/[^"\')]+)', CSS)
        for asset in assets:
            self.assertTrue((ROOT / asset).is_file(), asset)
        self.assertGreaterEqual(len(assets), 6)
        self.assertNotIn("fonts.googleapis", HTML + CSS)

    def test_external_links_safe(self):
        for a in self.page.links:
            if a.get("target") == "_blank":
                self.assertIn("noopener", a.get("rel", "").split())
                self.assertIn("noreferrer", a.get("rel", "").split())

    def test_clear_onboarding_and_support(self):
        self.assertGreaterEqual(HTML.count(BOT), 8)
        self.assertIn("Попробовать бесплатно", HTML)
        self.assertIn("3 дня бесплатно", HTML)
        self.assertIn("Без привязки карты", HTML)
        self.assertIn(SUPPORT, HTML)
        for anchor in ("benefits", "app", "prices", "steps", "platforms", "faq", "friends"):
            self.assertIn(anchor, self.page.ids)

    def test_honest_tariff_math(self):
        self.assertIn("Тарифы рассчитаны по опубликованной сетке бота", HTML)
        self.assertIn("Все месяцы, включая дополнительные, оплачиваются", HTML)
        self.assertIn("автопродления", HTML)
        self.assertIn("const periodMonths = Object.freeze({1: 1, 3: 4, 6: 8, 12: 15})", JS)
        self.assertIn("const baseMonthlyRub = Object.freeze({1: 89, 3: 79, 6: 69, 12: 59})", JS)
        self.assertIn("const deviceSurchargeRub = Object.freeze({2: 0, 5: 20, 10: 40})", JS)
        for term in ("1", "3", "6", "12"):
            self.assertIn(f'data-months="{term}"', HTML)
        for devices in ("2", "5", "10"):
            self.assertIn(f'data-tier="{devices}"', HTML)

    def test_no_unverified_releases_or_performance_claims(self):
        for phrase in ("100% аноним", "99.99%", "no-logs", "10 Гбит/с",
                       "гарантированно работает", "скачать APK", "более 1000 пользователей"):
            self.assertNotIn(phrase.lower(), HTML.lower())
        self.assertIn("публичную загрузку не обещаем", HTML)
        self.assertNotIn(".apk", re.sub(r'[^"\']*(href|src)=', "", HTML))
        self.assertIn("не VPN-подключение", HTML)

    def test_demo_local_and_disclosed(self):
        self.assertIn('id="demo-stage"', HTML)
        self.assertIn('id="demo-switch"', HTML)
        self.assertIn('id="demo-live"', HTML)
        for state in ("off", "connecting", "on"):
            self.assertIn(f'data-demo-state="{state}"', HTML)
        for state in ("VPN выключен", "Подключение…", "VPN запущен"):
            self.assertIn(state, JS)
        self.assertIn("VPN на сайте не подключается", HTML)
        for api in ("fetch(", "new WebSocket(", "XMLHttpRequest", "sendBeacon("):
            self.assertNotIn(api, JS)

    def test_accessible_navigation(self):
        self.assertEqual(self.page.headings.count("h1"), 1)
        self.assertGreaterEqual(len(self.page.sections), 9)
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('aria-controls="mobile-nav"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn('role="status"', HTML)
        self.assertIn('prefers-reduced-motion', CSS)
        self.assertIn(':focus-visible', CSS)
        self.assertIn('event.key === "Escape"', JS)
        self.assertFalse(any("disabled" in x for x in self.page.buttons))

    def test_seo(self):
        for tag in ('<html lang="ru">', 'rel="canonical"', 'property="og:image"',
                    '"@type":"WebSite"', '<title>ByMeVPN'):
            self.assertIn(tag, HTML)


if __name__ == "__main__":
    unittest.main()
