"""Generate PNG icons for the Chrome extension."""
from PIL import Image, ImageDraw
import os

SIZES = [16, 48, 128]
OUT_DIR = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

for size in SIZES:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size

    # Background rounded rect
    r = max(s // 5, 2)
    draw.rounded_rectangle([0, 0, s-1, s-1], radius=r, fill=(59, 130, 246))

    # Bag body (white rectangle)
    bx1, by1 = int(s * 0.23), int(s * 0.31)
    bx2, by2 = int(s * 0.77), int(s * 0.75)
    br = max(s // 16, 1)
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=br, fill=(255, 255, 255))

    # Bag handle
    hx1, hy1 = int(s * 0.37), int(s * 0.17)
    hx2, hy2 = int(s * 0.63), int(s * 0.31)
    hw = max(s // 32, 1)
    draw.arc([hx1, hy1, hx2, hy2 + (hy2 - hy1)], 180, 0, fill=(255, 255, 255), width=max(s // 20, 1))

    # Ruler line at bottom
    ry = int(s * 0.82)
    rx1, rx2 = int(s * 0.2), int(s * 0.8)
    lw = max(s // 40, 1)
    draw.line([rx1, ry, rx2, ry], fill=(30, 64, 175), width=lw)
    # Ruler ticks
    tick_h = max(s // 16, 1)
    for tx in [rx1, (rx1+rx2)//2, rx2]:
        draw.line([tx, ry, tx, ry - tick_h], fill=(30, 64, 175), width=lw)

    # Green checkmark circle
    cx, cy = int(s * 0.75), int(s * 0.28)
    cr = max(s // 8, 2)
    draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(16, 185, 129))
    # Checkmark
    if size >= 48:
        cl = max(cr // 3, 1)
        draw.line([cx - cr//2, cy, cx - cr//6, cy + cr//3], fill='white', width=max(s//40, 1))
        draw.line([cx - cr//6, cy + cr//3, cx + cr//2, cy - cr//3], fill='white', width=max(s//40, 1))

    img.save(os.path.join(OUT_DIR, f'icon{size}.png'))
    print(f'Generated icon{size}.png')
