import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

WEB_DIR = Path("/home/petroprog/Projects/news-ai/web")
ICONS_DIR = WEB_DIR / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)


def draw_four_point_star(draw, cx, cy, outer_r, inner_r, color):
    points = []
    for i in range(8):
        angle = i * math.pi / 4.0 - math.pi / 2.0
        r = outer_r if i % 2 == 0 else inner_r
        px = cx + math.cos(angle) * r
        py = cy + math.sin(angle) * r
        points.append((px, py))
    draw.polygon(points, fill=color)


def create_base_icon(size=1024, maskable=False):
    S = 1024
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # Background gradient (#020617 to #0f172a)
    bg = Image.new("RGBA", (S, S), (2, 6, 23, 255))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(S):
        t = y / float(S)
        r = int(2 + t * 13)
        g = int(6 + t * 17)
        b = int(23 + t * 28)
        bg_draw.line([(0, y), (S, y)], fill=(r, g, b, 255))

    if maskable:
        img.paste(bg, (0, 0))
        scale = 0.72
    else:
        mask = Image.new("L", (S, S), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.rounded_rectangle([16, 16, S - 16, S - 16], radius=220, fill=255)
        img.paste(bg, (0, 0), mask)
        scale = 0.88

    # Subtle glowing radial aura in center
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    cx, cy = S // 2, S // 2
    glow_r = int(340 * scale)
    g_draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=(14, 165, 233, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=75))
    img = Image.alpha_composite(img, glow)

    # Outer gradient frame box
    box_half = int(330 * scale)
    box_rect = [cx - box_half, cy - box_half, cx + box_half, cy + box_half]
    corner_r = int(145 * scale)

    border_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border_layer)
    for y in range(box_rect[1], box_rect[3]):
        t = (y - box_rect[1]) / max(1.0, float(box_rect[3] - box_rect[1]))
        if t < 0.5:
            u = t * 2.0
            r = int(56 + u * (99 - 56))
            g = int(189 + u * (102 - 189))
            b = int(248 + u * (241 - 248))
        else:
            u = (t - 0.5) * 2.0
            r = int(99 + u * (45 - 99))
            g = int(102 + u * (212 - 102))
            b = int(241 + u * (191 - 241))
        b_draw.line([(box_rect[0], y), (box_rect[2], y)], fill=(r, g, b, 255))

    box_mask = Image.new("L", (S, S), 0)
    bm_draw = ImageDraw.Draw(box_mask)
    bm_draw.rounded_rectangle(box_rect, radius=corner_r, fill=255)

    border_thickness = int(18 * scale)
    inner_rect = [
        box_rect[0] + border_thickness,
        box_rect[1] + border_thickness,
        box_rect[2] - border_thickness,
        box_rect[3] - border_thickness,
    ]
    bm_draw.rounded_rectangle(inner_rect, radius=max(10, corner_r - border_thickness), fill=0)

    inner_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    il_draw = ImageDraw.Draw(inner_layer)
    il_draw.rounded_rectangle(inner_rect, radius=max(10, corner_r - border_thickness), fill=(9, 14, 28, 242))
    img = Image.alpha_composite(img, inner_layer)
    img.paste(border_layer, (0, 0), box_mask)
    draw = ImageDraw.Draw(img)

    # AI Sparkle stars
    main_star_cx = cx - int(45 * scale)
    main_star_cy = cy - int(20 * scale)
    draw_four_point_star(draw, main_star_cx, main_star_cy, int(165 * scale), int(44 * scale), (56, 189, 248, 255))
    draw_four_point_star(draw, main_star_cx, main_star_cy, int(85 * scale), int(22 * scale), (224, 242, 254, 255))

    sec_star_cx = cx + int(130 * scale)
    sec_star_cy = cy - int(135 * scale)
    draw_four_point_star(draw, sec_star_cx, sec_star_cy, int(78 * scale), int(21 * scale), (129, 140, 248, 255))

    third_star_cx = cx + int(115 * scale)
    third_star_cy = cy + int(115 * scale)
    draw_four_point_star(draw, third_star_cx, third_star_cy, int(48 * scale), int(14 * scale), (45, 212, 191, 255))

    # Emerald live indicator dot
    dot_x = box_rect[2] - int(24 * scale)
    dot_y = box_rect[1] + int(24 * scale)
    dot_r = int(34 * scale)
    draw.ellipse([dot_x - dot_r - 8, dot_y - dot_r - 8, dot_x + dot_r + 8, dot_y + dot_r + 8], fill=(2, 6, 23, 255))
    draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=(16, 185, 129, 255))
    draw.ellipse([dot_x - int(dot_r * 0.45), dot_y - int(dot_r * 0.45), dot_x + int(dot_r * 0.15), dot_y + int(dot_r * 0.15)], fill=(167, 243, 208, 255))

    if size != S:
        img = img.resize((size, size), Image.Resampling.LANCZOS)
    return img


def create_screenshot(width, height):
    img = Image.new("RGB", (width, height), (3, 7, 18))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, width, 72], fill=(15, 23, 42))
    draw.line([(0, 72), (width, 72)], fill=(30, 41, 59), width=2)
    logo = create_base_icon(size=44, maskable=False)
    img.paste(logo, (24, 14), logo)
    pad = 24
    y = 96
    card_h = 160
    cols = 2 if width > 800 else 1
    col_w = (width - pad * (cols + 1)) // cols
    for row in range(4):
        for col in range(cols):
            x0 = pad + col * (col_w + pad)
            y0 = y + row * (card_h + 20)
            if y0 + card_h > height - 20:
                continue
            draw.rounded_rectangle([x0, y0, x0 + col_w, y0 + card_h], radius=18, fill=(15, 23, 42), outline=(30, 41, 59), width=2)
            draw.rounded_rectangle([x0 + 20, y0 + 20, x0 + 130, y0 + 46], radius=8, fill=(14, 165, 233))
            draw.rounded_rectangle([x0 + 20, y0 + 62, x0 + col_w - 30, y0 + 82], radius=6, fill=(226, 232, 240))
            draw.rounded_rectangle([x0 + 20, y0 + 94, x0 + int(col_w * 0.75), y0 + 112], radius=6, fill=(148, 163, 184))
            draw.rounded_rectangle([x0 + 20, y0 + 126, x0 + int(col_w * 0.5), y0 + 140], radius=5, fill=(71, 85, 105))
    return img


if __name__ == "__main__":
    create_base_icon(192, maskable=False).save(ICONS_DIR / "icon-192.png", "PNG")
    create_base_icon(512, maskable=False).save(ICONS_DIR / "icon-512.png", "PNG")
    create_base_icon(192, maskable=True).save(ICONS_DIR / "icon-maskable-192.png", "PNG")
    create_base_icon(512, maskable=True).save(ICONS_DIR / "icon-maskable-512.png", "PNG")

    apple_icon = create_base_icon(180, maskable=True).convert("RGB")
    apple_icon.save(ICONS_DIR / "apple-touch-icon.png", "PNG")
    apple_icon.save(WEB_DIR / "apple-touch-icon.png", "PNG")

    ico_base = create_base_icon(256, maskable=False)
    ico_base.save(ICONS_DIR / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    ico_base.save(WEB_DIR / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="ring" x1="20" y1="20" x2="108" y2="108" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#2dd4bf"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#bg)"/>
  <rect x="22" y="22" width="84" height="84" rx="22" fill="#090e1c" stroke="url(#ring)" stroke-width="4"/>
  <path d="M58 38L62.5 53.5L78 58L62.5 62.5L58 78L53.5 62.5L38 58L53.5 53.5L58 38Z" fill="#38bdf8"/>
  <path d="M82 34L84.2 41.8L92 44L84.2 46.2L82 54L79.8 46.2L72 44L79.8 41.8L82 34Z" fill="#818cf8"/>
  <path d="M79 72L80.6 77.4L86 79L80.6 80.6L79 86L77.4 80.6L72 79L77.4 77.4L79 72Z" fill="#2dd4bf"/>
  <circle cx="100" cy="28" r="7" fill="#10b981" stroke="#020617" stroke-width="3"/>
</svg>"""
    (ICONS_DIR / "favicon.svg").write_text(svg_content, encoding="utf-8")

    create_screenshot(1280, 720).save(ICONS_DIR / "screenshot-wide.png", "PNG")
    create_screenshot(540, 960).save(ICONS_DIR / "screenshot-mobile.png", "PNG")
    print("PWA icons and screenshots generated successfully!")
