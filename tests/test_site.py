"""ByMeVPN final landing: source-of-truth, semantic HTML, safety and conversion contracts."""
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


class Markup(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.images, self.buttons, self.sections = [], [], [], [], []
        self.headings = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a: self.ids.append(a["id"])
        if tag == "a": self.links.append(a)
        if tag == "img": self.images.append(a)
        if tag == "button": self.buttons.append(a)
        if tag == "section": self.sections.append(a)
        if tag in ("h1", "h2", "h3"): self.headings.append((tag, a))


class SiteContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dom = Markup()
        cls.dom.feed(HTML)

    def test_ids_unique(self):
        self.assertEqual(len(self.dom.ids), len(set(self.dom.ids)))

    def test_anchor_targets_exist(self):
        for link in self.dom.links:
            href = link.get("href", "")
            if href.startswith("#"):
                self.assertIn(href[1:], self.dom.ids, href)
            self.assertNotEqual(href, "#")
            self.assertFalse(href.lower().startswith("javascript:"))

    def test_images_accessible_and_assets_exist(self):
        for img in self.dom.images:
            self.assertIn("alt", img)
        paths = re.findall(r'(?:src|href)="(assets/[^"]+)"', HTML)
        paths += re.findall(r'url\(["\']?(assets/[^"\')]+)', CSS)
        self.assertTrue(paths)
        for path in paths:
            self.assertTrue((ROOT / path).is_file(), path)
        self.assertNotIn("fonts.googleapis", CSS + HTML)

    def test_external_links_safe(self):
        for link in self.dom.links:
            if link.get("target") == "_blank":
                rel = set(link.get("rel", "").split())
                self.assertGreaterEqual(len(rel.intersection({"noopener", "noreferrer"})), 2, link)

    def test_clear_one_primary_sales_journey(self):
        self.assertGreaterEqual(HTML.count(BOT), 7)
        self.assertIn("Получить 3 дня бесплатно", HTML)
        self.assertIn("3 дня бесплатно", HTML)
        self.assertIn(SUPPORT, HTML)
        self.assertIn('id="pricing"', HTML)
        self.assertIn('id="how"', HTML)

    def test_no_fabricated_downloads_security_or_performance(self):
        for text in ("10 Гбит/с", "99,99%", "99.99%", "no-logs", "100% аноним",
                     "публичный APK доступен", "кнопка скачать APK", "отзывы клиентов"):
            self.assertNotIn(text.lower(), HTML.lower())
        self.assertNotIn('href="downloads/', HTML)
        self.assertNotIn('href="https://play.google.com', HTML)
        self.assertIn("Фирменные приложения находятся в разработке", HTML)
        self.assertIn("не реальное подключение", HTML.lower())

    def test_pricing_matches_bot_documented_constants(self):
        for period in (1, 3, 6, 12):
            self.assertIn(f'data-months="{period}"', HTML)
        for tier in (2, 5, 10):
            self.assertIn(f'data-tier="{tier}"', HTML)
        for fragment in ('{1: 89, 3: 79, 6: 69, 12: 59}',
                         '{2: 0, 5: 20, 10: 40}',
                         '{1: 1, 3: 4, 6: 8, 12: 15}'):
            self.assertIn(fragment, JS)
        self.assertIn("оплачивается весь срок сразу", HTML.lower())
        self.assertIn("автопродления", HTML.lower())
        self.assertIn("aria-live=\"polite\"", HTML)

    def test_demo_is_disclosed_and_offline(self):
        self.assertIn('id="demo-stage"', HTML)
        self.assertIn('id="demo-switch"', HTML)
        for state in ("off", "connecting", "on"):
            self.assertIn(f'data-demo-state="{state}"', HTML)
        for label in ("VPN выключен", "Подключение…", "VPN запущен"):
            self.assertIn(label, JS)
        for api in ("fetch(", "XMLHttpRequest", "new WebSocket("):
            self.assertNotIn(api, JS)
        self.assertIn("Сайт не создаёт VPN-соединение", HTML)

    def test_semantics_and_accessibility(self):
        self.assertEqual(sum(1 for x in self.dom.headings if x[0] == "h1"), 1)
        self.assertGreaterEqual(len(self.dom.sections), 8)
        for name in ("main", "features", "experience", "pricing", "how", "download", "faq"):
            self.assertIn(name, self.dom.ids)
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('aria-controls="mobile-nav"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn('role="status"', HTML)
        self.assertIn("event.key === \"Escape\"", JS)
        self.assertIn(":focus-visible", CSS)
        self.assertIn("prefers-reduced-motion", CSS + JS)
        self.assertNotIn('[data-reveal]{opacity:0', CSS.replace(" ", ""))

    def test_seo_essentials(self):
        self.assertIn('<html lang="ru">', HTML)
        self.assertIn('rel="canonical"', HTML)
        self.assertIn('property="og:image"', HTML)
        self.assertIn('"@type":"WebSite"', HTML)
        self.assertIn('<title>ByMeVPN', HTML)

    def test_no_inert_fake_controls(self):
        self.assertEqual(len([b for b in self.dom.buttons if "disabled" in b]), 0)
        self.assertEqual(len([b for b in self.dom.buttons if b.get("data-tier")]), 3)
        self.assertEqual(len([b for b in self.dom.buttons if b.get("data-demo-state")]), 3)


if __name__ == "__main__":
    unittest.main()
