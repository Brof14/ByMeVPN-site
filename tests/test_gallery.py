"""Regression assertions for the additive ByMeVPN premium gallery."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")

class GalleryContractTests(unittest.TestCase):
    def test_four_core_screen_previews_present(self):
        self.assertIn('id="screens"', HTML)
        self.assertEqual(HTML.count('class="pv-tile"'), 4)
        for word in ("СОЕДИНЕНИЕ", "ТАРИФЫ", "НАСТРОЙКИ", "АККАУНТ"):
            self.assertIn(word, HTML)

    def test_gallery_is_explicitly_a_demo(self):
        self.assertIn("Демонстрационные макеты", HTML)
        self.assertIn("зависят от версии приложения и аккаунта", HTML)

    def test_only_current_local_shield_asset_is_used(self):
        self.assertIn('src="assets/brand/bymevpn-shield.png"', HTML)
        self.assertTrue((ROOT / "assets/brand/bymevpn-shield.png").is_file())

    def test_real_telegram_onboarding_is_visible(self):
        self.assertIn('class="button pv-hero-cta"', HTML)
        self.assertIn('href="https://t.me/ByMeVPNbot"', HTML)
        self.assertIn('target="_blank" rel="noopener noreferrer"', HTML)

    def test_android_download_still_disabled(self):
        self.assertIn("Публичная загрузка недоступна", HTML)
        self.assertIn('class="button button-disabled"', HTML)
        self.assertNotIn("play.google.com", HTML)

    def test_gallery_is_responsive_and_has_reduced_motion(self):
        for needle in (
            ".pv-grid", "@media(max-width:580px)",
            "scroll-snap-type:x mandatory",
            "@media(prefers-reduced-motion:reduce)"
        ):
            self.assertIn(needle, CSS)

if __name__ == "__main__":
    unittest.main()
