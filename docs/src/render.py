"""Re-render every README image from the sources in this folder. One command:

    python docs/src/render.py

Makes docs/hero.gif, docs/hero.png (the hero's end state, 2x, also the social preview),
docs/before-after.gif and docs/how-it-works.gif. These are illustrations, except the "after"
half of before-after, which is app-tree.png: a real screenshot of the app in sample mode (shoot_app.py).
The real-app recordings (demo-browse.gif, demo-admin.gif) come from record_demo.py.

Needs: pip install playwright && playwright install chromium; ffmpeg on PATH.
"""
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

SRC = Path(__file__).resolve().parent
DOCS = SRC.parent
REC = [sys.executable, str(SRC / 'record_html.py')]


def still(html, out, w, h, ms):
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
        pg.goto((SRC / html).as_uri())
        pg.wait_for_load_state('networkidle')
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(300)
        pg.evaluate('(ms) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; } }', ms)
        pg.screenshot(path=str(out))
        b.close()
    print('wrote', out)


def gif(html, out, *args):
    subprocess.run(REC + [str(SRC / html), str(DOCS / out), *args], check=True)


if __name__ == '__main__':
    gif('hero.html', 'hero.gif', '--w', '1400', '--h', '700', '--dur', '9', '--fps', '15', '--colors', '96')
    still('hero.html', DOCS / 'hero.png', 1400, 700, 8000)
    gif('before-after.html', 'before-after.gif', '--w', '1200', '--h', '720', '--dur', '10', '--fps', '12', '--colors', '128')
    gif('how-it-works.html', 'how-it-works.gif', '--w', '1200', '--h', '660', '--dur', '11', '--fps', '12', '--colors', '96')
