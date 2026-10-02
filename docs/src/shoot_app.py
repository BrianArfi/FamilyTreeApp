"""Take docs/src/app-tree.png: a real screenshot of the app in sample mode (fictional family).

Needs the dev server in sample mode:  VITE_SAMPLE_DATA=true npx vite --port 5199 --strictPort
Then:                                 python docs/src/shoot_app.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent / 'app-tree.png'
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1360, 'height': 1080}, device_scale_factor=2)
    pg.route('**/script.google.com/**', lambda r: r.abort())
    pg.goto('http://localhost:5199/')
    pg.wait_for_selector('.node-card')
    pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT), clip={'x': 0, 'y': 0, 'width': 1360, 'height': 1080})
    b.close()
print('wrote', OUT)
