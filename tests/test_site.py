"""Product and accessibility contracts for the ByMeVPN marketing site."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[];self.links=[];self.images=[];self.buttons=[];self.reveals=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if 'data-reveal' in a:self.reveals+=1
        if tag=='a':self.links.append(a)
        if tag=='img':self.images.append(a)
        if tag=='button':self.buttons.append(a)

class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dom=Parser();cls.dom.feed(HTML)
    def test_unique_ids(self):
        self.assertEqual(len(self.dom.ids),len(set(self.dom.ids)))
    def test_internal_links(self):
        for a in self.dom.links:
            href=a.get('href','')
            if href.startswith('#'):self.assertIn(href[1:],self.dom.ids)
    def test_images_and_assets(self):
        for img in self.dom.images:self.assertIn('alt',img)
        for path in re.findall(r'(?:href|src)="(assets/[^"]+)"',HTML):
            self.assertTrue((ROOT/path).is_file(),path)
    def test_external_links_safe(self):
        for a in self.dom.links:
            if a.get('target')=='_blank':
                self.assertIn('noopener',a.get('rel',''))
                self.assertIn('noreferrer',a.get('rel',''))
    def test_android_first_no_fake_apk(self):
        self.assertIn('Скачать для Android',HTML)
        self.assertIn('href="#download"',HTML)
        self.assertIn('disabled aria-describedby="release-explainer"',HTML)
        self.assertNotIn('href="https://t.me/ByMeVPNbot" class="button button-primary"',HTML)
        self.assertNotIn('href="https://t.me/ByMeVPNbot"',HTML.split('id="download"')[0])
        self.assertNotIn('.apk"',HTML)
    def test_no_fabricated_claims(self):
        for term in ['100% аноним','no-logs','99.99%','10 Гбит/с','3 дня бесплатно']:
            self.assertNotIn(term.lower(),HTML.lower())
    def test_demo_is_local_and_interactive(self):
        self.assertIn('id="demo-switch"',HTML)
        self.assertIn('id="demo-status-text"',HTML)
        for label in ['VPN выключен','Подключение…','VPN запущен']:
            self.assertIn(label,JS)
        for api in ['fetch(', 'new WebSocket(', 'XMLHttpRequest']:
            self.assertNotIn(api,JS)
    def test_reveals_cannot_hide_sections(self):
        self.assertGreaterEqual(self.dom.reveals,10)
        self.assertNotRegex(CSS,r'\[data-reveal\]\s*\{\s*opacity:\s*0')
        self.assertIn('[data-reveal].is-visible',CSS)
        self.assertIn("classList.add('is-visible')",JS)
        self.assertNotIn('is-revealed',CSS+JS)
    def test_accessibility(self):
        self.assertIn('class="skip-link"',HTML)
        self.assertIn('aria-pressed="false"',HTML)
        self.assertIn('aria-expanded="false"',HTML)
        self.assertIn('prefers-reduced-motion',CSS+JS)
        self.assertIn('focus-visible',CSS)
        self.assertIn('Escape',JS)
    def test_sections(self):
        for id_ in ['main','experience','features','download','questions']:
            self.assertIn(id_,self.dom.ids)
        self.assertGreaterEqual(HTML.count('<section'),6)

if __name__=='__main__': unittest.main()
