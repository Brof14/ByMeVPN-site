"""Static contract checks for the ByMeVPN product-story site."""
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
        self.details_count = 0
        self.reveal_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if "data-reveal" in attrs:
            self.reveal_count += 1
        if tag == "a":
            self.links.append(attrs)
        if tag == "img":
            self.images.append(attrs)
        if tag == "button":
            self.buttons.append(attrs)
        if tag == "details":
            self.details_count += 1


class SiteContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = SiteParser()
        cls.doc.feed(HTML)

    def test_no_duplicate_ids(self):
        self.assertEqual(len(self.doc.ids), len(set(self.doc.ids)))

    def test_internal_targets_resolve(self):
        ids = set(self.doc.ids)
        for link in self.doc.links:
            href = link.get("href", "")
            if href.startswith("#"):
                self.assertIn(href[1:], ids, href)
        self.assertIn("benefits", ids)

    def test_external_blank_tabs_are_safe(self):
        for link in self.doc.links:
            if link.get("target") == "_blank":
                rel = set(link.get("rel", "").split())
                self.assertTrue({"noopener", "noreferrer"}.issubset(rel), link)

    def test_images_have_alt_and_local_assets_exist(self):
        self.assertTrue(self.doc.images)
        for image in self.doc.images:
            self.assertIn("alt", image)
        self.assertNotIn("fonts.googleapis.com", HTML + CSS)
        self.assertNotIn("raw.githubusercontent.com", HTML + CSS)
        paths = re.findall(r'(?:src|href)="(assets/[^\"]+)"', HTML)
        paths += re.findall(r'url\(["\']?(assets/[^"\')]+)', CSS)
        self.assertTrue(paths)
        for relative in paths:
            with self.subTest(path=relative):
                self.assertTrue((ROOT / relative).is_file(), relative)

    def test_no_unverified_trial_price_or_network_promises(self):
        for claim in (
            "3 дня бесплатно", "без привязки банковской карты", "89 ₽", "316 ₽",
            "552 ₽", "885 ₽", "10 Гбит/с", "no-logs", "полностью анонимный",
            "15+ стран", "100% аноним", "бесплатный пробный период",
        ):
            self.assertNotIn(claim.lower(), HTML.lower())
        self.assertNotIn('class="plan"', HTML)

    def test_android_release_is_honest_and_disabled(self):
        self.assertIn("Публичной Android-сборки пока нет", HTML)
        self.assertIn("Публичная загрузка недоступна", HTML)
        download_buttons = [b for b in self.doc.buttons if "button-disabled" in b.get("class", "")]
        self.assertEqual(len(download_buttons), 1)
        self.assertTrue(all("disabled" in button for button in download_buttons))
        self.assertFalse(any("download" in link.get("href", "").lower() for link in self.doc.links))
        self.assertFalse(any(".apk" in link.get("href", "").lower() for link in self.doc.links))
        self.assertNotIn("play.google.com", HTML)

    def test_android_mock_matches_confirmed_ui_and_is_disclosed(self):
        self.assertIn('id="demo-screen" data-state="off"', HTML)
        for label in ("VPN выключен", "Подключение…", "VPN запущен"):
            self.assertIn(label, HTML)
        self.assertIn("Сервер не выбран", HTML)
        self.assertIn("Выберите страну или доверьтесь автоматике", HTML)
        self.assertIn("Подберём сервер", HTML)
        for nav_label in ("Главная", "Настройки", "Аккаунт"):
            self.assertIn(f">{nav_label}</span>", HTML)
        self.assertIn("макет интерфейса", HTML.lower())
        self.assertIn("реальное подключение не запускается", HTML.lower())
        self.assertIn('aria-live="polite"', HTML)

    def test_demo_has_four_scenes_no_network_and_reduced_motion(self):
        for scene in ("off", "connecting", "connected", "servers"):
            self.assertIn(f'data-demo-scene="{scene}"', HTML)
            self.assertIn(f'data-scene="{scene}"', HTML)
        for state in ("connecting", "connected"):
            self.assertIn(f'{state}:', JS)
        self.assertIn('sceneId === "servers"', JS)
        for api in ("fetch(", "XMLHttpRequest", "WebSocket("):
            self.assertNotIn(api, JS)
        self.assertIn("IntersectionObserver", JS)
        self.assertIn('matchMedia("(prefers-reduced-motion: reduce)")', JS)
        self.assertIn("scrollToScene", JS)
        self.assertIn('window.scrollTo({ top:', JS)
        self.assertIn('render();', JS)
        self.assertNotIn("sceneObserver", JS)
        self.assertIn("requestAnimationFrame(syncSceneToScroll)", JS)

    def test_reveals_use_one_class_and_are_visible_without_javascript(self):
        self.assertEqual(self.doc.reveal_count, 14)
        self.assertIn(".reveal-enabled [data-reveal]:not(.is-visible)", CSS)
        self.assertIn(".reveal-enabled [data-reveal].is-visible", CSS)
        self.assertIn('entry.target.classList.add("is-visible")', JS)
        self.assertNotIn("is-revealed", CSS + JS)
        self.assertRegex(CSS, r"(?s)\[data-reveal\]\s*\{[^}]*opacity:\s*1")
        self.assertIn('"IntersectionObserver" in window', JS)

    def test_story_scenes_have_four_explicit_ordered_rows(self):
        rows = re.findall(
            r"\.story-scenes\s*>\s*\.story-scene:nth-child\((\d)\)\s*\{\s*grid-row:\s*(\d)",
            CSS,
        )
        self.assertEqual(rows, [("1", "1"), ("2", "2"), ("3", "3"), ("4", "4")])
        self.assertIn("grid-template-rows: repeat(4, minmax(66svh, auto))", CSS)
        self.assertIn("grid-template-rows: repeat(4, minmax(94svh, auto))", CSS)
        self.assertNotRegex(CSS, r"\.story-scene:nth-child\(5\)")

    def test_menu_and_selection_controls_are_accessible(self):
        self.assertIn('aria-expanded="false"', HTML)
        self.assertIn('aria-controls="site-nav"', HTML)
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('aria-controls="server-sheet"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn("event.key === \"Escape\"", JS)
        self.assertIn('querySelector(".menu-toggle")', JS)

    def test_faq_and_purchase_disclosure_remain(self):
        self.assertEqual(self.doc.details_count, 7)
        self.assertIn("полную сумму", HTML.lower())
        self.assertIn("автопродление", HTML.lower())
        self.assertIn("способ отмены", HTML.lower())

    def test_responsive_motion_and_focus_styles_exist(self):
        for fragment in (
            "@media (max-width: 350px)", "@media (max-width: 540px)",
            "@media (max-width: 760px)", "@media (prefers-reduced-motion: reduce)",
            ":focus-visible", "overflow-x: clip",
        ):
            self.assertIn(fragment, CSS)
        for width in (360, 390, 768, 1280, 1440, 1920):
            self.assertIn(str(width), (ROOT / "docs/designs/bymevpn-product-story.md").read_text(encoding="utf-8"))

    def test_css_root_closed_and_balanced(self):
        # A missing :root brace once nested the entire stylesheet under :root.
        self.assertEqual(CSS.count("{"), CSS.count("}"), "CSS block delimiters are unbalanced")
        self.assertRegex(CSS, r"--tone-0729ae0e:[^;]+;\s*\}\s*\*,")
        self.assertIn(".site-nav .nav-cta", CSS)
        self.assertIn(".journey-strip", CSS)

    def test_primary_onboarding_is_working_and_honest(self):
        self.assertIn('class="button button-primary" href="https://t.me/ByMeVPNbot"', HTML)
        self.assertIn('class="nav-cta" href="https://t.me/ByMeVPNbot"', HTML)
        self.assertIn("Открыть ByMeVPN в Telegram", HTML)
        self.assertIn('rel="noopener noreferrer"', HTML)
        self.assertIn('rel="canonical"', HTML)
        self.assertEqual(HTML.count("Скачать для Android"), 1)
        self.assertIn("Демонстрация активного состояния", JS)
        self.assertNotIn("Устанавливаем туннель", JS)

    def test_no_placeholder_links_or_stale_download_logic(self):
        for link in self.doc.links:
            self.assertNotEqual(link.get("href"), "#")
            self.assertFalse(link.get("href", "").startswith("javascript:"))
        self.assertNotIn("androidReleaseCard", JS)
        self.assertNotIn("trustedApkUrl", JS)


if __name__ == "__main__":
    unittest.main()
