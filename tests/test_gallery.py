"""Guard the optional, concept-only ByMeVPN screen gallery."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
GALLERY = (ROOT / "screens.html").read_text(encoding="utf-8")


class GalleryContractTests(unittest.TestCase):
    def test_gallery_is_reachable_from_home(self):
        self.assertGreaterEqual(INDEX.count('href="screens.html"'), 2)

    def test_marketing_cta_uses_real_bot(self):
        self.assertIn('class="button button-bot"', INDEX)
        self.assertIn('href="https://t.me/ByMeVPNbot"', INDEX)
        self.assertIn('class="button button-disabled"', INDEX)

    def test_all_sixteen_screens_are_declared(self):
        rows = re.findall(r"\['(\d{2})','[^']+','[^']+','(?:connection|account)'\]", GALLERY)
        self.assertEqual(rows, [f"{index:02d}" for index in range(1, 17)])

    def test_unreleased_app_is_clearly_labeled(self):
        self.assertIn("Визуальные концепты", GALLERY)
        self.assertIn("Публичный Android-релиз пока не подтверждён", GALLERY)
        self.assertNotIn("Скачать APK", GALLERY)

    def test_approved_logo_is_reused(self):
        self.assertIn("assets/brand/bymevpn-shield.png", GALLERY)
        self.assertTrue((ROOT / "assets/brand/bymevpn-shield.png").exists())

    def test_no_false_speed_or_anonymity_claims(self):
        for term in ("10 Гбит/с", "no-logs", "полностью анонимный", "15+ стран"):
            self.assertNotIn(term.lower(), GALLERY.lower())

    def test_accessibility_and_reduced_motion(self):
        self.assertIn('aria-pressed="true"', GALLERY)
        self.assertIn("prefers-reduced-motion:reduce", GALLERY)
        self.assertIn(":focus-visible", GALLERY)
        self.assertIn("data-filter", GALLERY)


if __name__ == "__main__":
    unittest.main()
