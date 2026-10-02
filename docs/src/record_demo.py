"""Record the real-app GIFs (docs/demo-browse.gif, docs/demo-admin.gif) with Playwright.

Everything shown is the real React app from this repo, running locally in its opt-in sample mode,
so the family on screen is fictional (src/sample/sample-family.json). No real family data is used:
sample mode never fetches, and this script also blocks any request to script.google.com.

    # terminal 1, from the repo root
    VITE_SAMPLE_DATA=true npx vite --port 5199 --strictPort
    # terminal 2
    python docs/src/record_demo.py            # both GIFs
    python docs/src/record_demo.py browse     # or just one

Needs Playwright with Chromium (pip install playwright && playwright install chromium) and ffmpeg.
"""
import asyncio
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent
WORK = Path(tempfile.gettempdir()) / 'familytree-demo'
BASE = 'http://localhost:5199/'
W, H = 1360, 800      # viewport, wide enough for a 4-card generation next to the sidebar
OUT_W = 1100          # GIF width
FPS = 10

# Shared cursor for the family's GIFs: an ink dot with a lime ring.
CURSOR = """
window.addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;border-radius:50%;background:#072B27;border:4px solid #C8F751;box-shadow:0 0 0 1.5px #072B27,0 2px 6px rgba(0,0,0,.25);z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);transition:transform .03s linear;box-sizing:border-box';
  document.documentElement.appendChild(c);
  window.addEventListener('mousemove', e => { c.style.transform = `translate(${e.clientX - 11}px,${e.clientY - 11}px)`; }, true);
});
"""

# A caption chip, so nobody mistakes the sample family for real people.
CHIP = """(text) => {
  let t = document.getElementById('__chip');
  if (!t) { t = document.createElement('div'); t.id = '__chip'; document.body.appendChild(t); }
  t.textContent = text;
  t.style.cssText = 'position:fixed;left:50%;top:9px;transform:translateX(-50%);z-index:2147483646;background:#C8F751;color:#072B27;border:3px solid #072B27;border-radius:10px;padding:8px 16px;font:700 19px/1.2 "JetBrains Mono",Consolas,monospace;white-space:nowrap;box-shadow:4px 4px 0 #072B27';
}"""


async def new_ctx(b, name):
    vid = WORK / name
    shutil.rmtree(vid, ignore_errors=True)
    ctx = await b.new_context(viewport={'width': W, 'height': H}, record_video_dir=str(vid),
                              record_video_size={'width': W, 'height': H})
    await ctx.add_init_script(CURSOR)
    await ctx.route('**/script.google.com/**', lambda r: r.abort())
    return ctx, vid


async def center(p, sel):
    bb = await p.locator(sel).first.bounding_box()
    return bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2


async def wheel(p, dx, dy, steps=20, pause=25):
    for _ in range(steps):
        await p.mouse.wheel(dx / steps, dy / steps)
        await p.wait_for_timeout(pause)


async def browse(b):
    ctx, vid = await new_ctx(b, 'browse')
    p = await ctx.new_page()
    await p.goto(BASE)
    await p.wait_for_selector('.node-card')
    await p.evaluate(CHIP, 'Real app, fictional sample family')
    await p.mouse.move(820, 470)
    await p.wait_for_timeout(1200)
    # Pan down, one generation at a time, then sideways and back.
    for _ in range(2):
        await wheel(p, 0, 250, steps=14)
        await p.wait_for_timeout(500)
    await wheel(p, 260, 0, steps=12)
    await p.wait_for_timeout(300)
    await wheel(p, -260, 0, steps=12)
    await p.wait_for_timeout(400)
    # Open a member: the card opens the member form.
    x, y = await center(p, '.node-card:has-text("Maya Hale")')
    await p.mouse.move(x, y, steps=16)
    await p.wait_for_timeout(400)
    await p.mouse.click(x, y)
    await p.wait_for_selector('.modal-content')
    await p.evaluate(CHIP, "Maya's parents and spouse, picked from the tree")
    await p.mouse.move(W - 230, H - 190, steps=12)
    await p.wait_for_timeout(2600)
    await ctx.close()
    return vid


async def admin(b):
    ctx, vid = await new_ctx(b, 'admin')
    p = await ctx.new_page()
    dialogs = []

    async def on_dialog(d):
        dialogs.append(d.message)
        await d.accept()
    p.on('dialog', on_dialog)

    await p.goto(BASE)
    await p.wait_for_selector('.node-card')
    await wheel(p, 0, 420, steps=1)
    await p.evaluate(CHIP, 'Admin: add a member, behind a password')
    await p.mouse.move(820, 470)
    await p.wait_for_timeout(900)
    x, y = await center(p, 'button:has-text("Add Member")')
    await p.mouse.move(x, y, steps=16)
    await p.mouse.click(x, y)
    await p.wait_for_selector('.modal-content')
    form = p.locator('.modal-content')

    async def go(sel):
        cx, cy = await center(p, sel)
        await p.mouse.move(cx, cy, steps=10)
        await p.mouse.click(cx, cy)

    await go('.modal-content input[name=name]')
    await p.keyboard.type('Ada Lane', delay=70)
    await form.locator('select[name=gender]').select_option('Female')
    await p.wait_for_timeout(300)
    await go('.modal-content select[name=father_id]')
    await form.locator('select[name=father_id]').select_option(label='Theo Lane')
    await p.wait_for_timeout(300)
    await go('.modal-content select[name=mother_id]')
    await form.locator('select[name=mother_id]').select_option(label='Maya Hale')
    await p.wait_for_timeout(300)
    await go('.modal-content input[name=birth_date]')
    await p.keyboard.type('08-01-2024', delay=60)
    # Wrong password first: the save is refused and the form stays open.
    await go('.modal-content input[type=password]')
    await p.keyboard.type('guess', delay=80)
    await go('.modal-content button[type=submit]')
    await p.wait_for_timeout(500)
    await p.evaluate(CHIP, 'App says: ' + (dialogs[-1] if dialogs else ''))
    await p.wait_for_timeout(2000)
    pw = form.locator('input[type=password]')
    await pw.fill('')
    await go('.modal-content input[type=password]')
    await p.keyboard.type('demo', delay=90)
    await go('.modal-content button[type=submit]')
    await p.wait_for_selector('.modal-content', state='detached')
    await p.wait_for_selector('.node-card:has-text("Ada Lane")')
    await p.evaluate(CHIP, 'App says: ' + dialogs[-1] + ' - Ada joins the 4th generation')
    await wheel(p, 0, 420, steps=16)
    await p.wait_for_timeout(300)
    x, y = await center(p, '.node-card:has-text("Ada Lane")')
    await p.mouse.move(x, y + 70, steps=16)
    await p.wait_for_timeout(2600)
    await ctx.close()
    return vid


def to_gif(vid, out, trim=0.5):
    src = next(vid.glob('*.webm'))
    fc = (f'[0:v]trim=start={trim},setpts=PTS-STARTPTS,fps={FPS},scale={OUT_W}:-1:flags=lanczos,hqdn3d=3:3:6:6,split[x][y];'
          '[x]palettegen=max_colors=96:stats_mode=diff[p];'
          '[y][p]paletteuse=dither=none:diff_mode=rectangle')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-filter_complex', fc,
                    '-loop', '0', str(out)], check=True)
    print('wrote', out, round(out.stat().st_size / 1e6, 2), 'MB')


async def main(which):
    from playwright.async_api import async_playwright
    WORK.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        if which in ('all', 'browse'):
            to_gif(await browse(b), DOCS / 'demo-browse.gif')
        if which in ('all', 'admin'):
            to_gif(await admin(b), DOCS / 'demo-admin.gif')
        await b.close()


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'all'))
