#!/usr/bin/env python3
"""Derive the site's Mash identity marks from the shipped artwork.

Source of truth:
- ../mash/branding/logo-solid.png (1024x1024, rounded square app icon)
- ../mash/branding/render_header_art.py (renders the bare header wordmark)
Outputs are committed under public/assets/mash/, so the site build never needs
the Mash repository present. Re-run this script only when the artwork changes.

Uses sips (macOS) for resampling and wraps PNGs into an ICO by hand: no Pillow.
"""

from __future__ import annotations

import importlib.util
import shutil
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRANDING_DIR = ROOT.parent / "mash" / "branding"
SOURCE = BRANDING_DIR / "logo-solid.png"
HEADER_ART_RENDERER = BRANDING_DIR / "render_header_art.py"
OUT_DIR = ROOT / "public" / "assets" / "mash"

PNG_OUTPUTS = {
    "logo-mark.png": 76,
    "logo-mark@2x.png": 152,
    "favicon-32.png": 32,
    "apple-touch-icon.png": 180,
}

ICO_SIZES = (16, 32, 48)
OG_SIZE = (1200, 630)
OG_MARK = 360
OG_BACKGROUND = "0x272823"


def resize(source: Path, target: Path, size: int) -> None:
    subprocess.run(
        ["sips", "-z", str(size), str(size), str(source), "--out", str(target)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def write_ico(target: Path, pngs: list[bytes], sizes: tuple[int, ...]) -> None:
    header = struct.pack("<HHH", 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries = b""
    for png, size in zip(pngs, sizes):
        entries += struct.pack(
            "<BBBBHHII",
            size if size < 256 else 0,
            size if size < 256 else 0,
            0,
            0,
            1,
            32,
            len(png),
            offset,
        )
        offset += len(png)
    target.write_bytes(header + entries + b"".join(pngs))


def write_og_card(target: Path, mark: Path) -> None:
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg is required for the share card; brew install ffmpeg")
    width, height = OG_SIZE
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"color=c={OG_BACKGROUND}:s={width}x{height}",
            "-i",
            str(mark),
            "-filter_complex",
            f"[1:v]scale={OG_MARK}:-1[mark];[0:v][mark]overlay=(W-w)/2:(H-h)/2",
            "-frames:v",
            "1",
            str(target),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def write_wordmarks() -> None:
    spec = importlib.util.spec_from_file_location("render_header_art", HEADER_ART_RENDERER)
    if spec is None or spec.loader is None:
        raise SystemExit(f"cannot load {HEADER_ART_RENDERER}")
    art = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(art)

    rows = art.parse()
    # Cell sizes chosen so both columns and half-rows land on exact pixels at
    # 1x and 2x, with no resampling blur in the navbar (50x36) or closing card (200x144).
    variants = (
        ("logo-wordmark.png", (2, 4)),
        ("logo-wordmark@2x.png", (4, 8)),
        ("logo-wordmark-lg.png", (8, 16)),
        ("logo-wordmark-lg@2x.png", (16, 32)),
    )
    for name, (cw, ch_) in variants:
        h_full = len(rows) * ch_
        w_full = max(len(r) for r in rows) * cw
        px = [[(0, 0, 0, 0) for _ in range(w_full)] for _ in range(h_full)]

        for gy, row in enumerate(rows):
            for gx, (ch, fg, bg) in enumerate(row):
                if fg is None or ch == " ":
                    continue
                x0 = gx * cw
                y0 = gy * ch_
                if ch == "█":
                    spans = [(fg, 0.0, 1.0)]
                elif ch == "▀":
                    spans = [(fg, 0.0, 0.5)]
                elif ch == "▄":
                    spans = [(fg, 0.5, 1.0)]
                elif ch in art.SHADE_ALPHA:
                    under = bg if bg is not None else art.WINDOW_BG
                    spans = [(art.mix(fg, under, art.SHADE_ALPHA[ch]), 0.0, 1.0)]
                else:
                    raise SystemExit(f"unexpected glyph {ch!r} in header art")
                for colour, t0, t1 in spans:
                    ya = y0 + round(t0 * ch_)
                    yb = y0 + round(t1 * ch_)
                    c = (*colour, 255)
                    for y in range(ya, yb):
                        for x in range(x0, x0 + cw):
                            px[y][x] = c

        ys = [y for y in range(h_full) if any(px[y][x][3] > 0 for x in range(w_full))]
        xs = [x for x in range(w_full) if any(px[y][x][3] > 0 for y in range(h_full))]
        cropped = [row[min(xs) : max(xs) + 1] for row in px[min(ys) : max(ys) + 1]]
        target = OUT_DIR / name
        art.write_png(target, cropped)
        print(f"wrote public/assets/mash/{name} ({len(cropped[0])}x{len(cropped)})")


def main() -> int:
    if not SOURCE.is_file():
        print(f"missing source artwork: {SOURCE}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_wordmarks()
    for name, size in PNG_OUTPUTS.items():
        resize(SOURCE, OUT_DIR / name, size)
        print(f"wrote public/assets/mash/{name} ({size}x{size})")

    tmp_dir = OUT_DIR / ".ico-parts"
    tmp_dir.mkdir(exist_ok=True)
    pngs = []
    for size in ICO_SIZES:
        part = tmp_dir / f"{size}.png"
        resize(SOURCE, part, size)
        pngs.append(part.read_bytes())
    write_ico(OUT_DIR / "favicon.ico", pngs, ICO_SIZES)
    for part in tmp_dir.iterdir():
        part.unlink()
    tmp_dir.rmdir()
    print(f"wrote public/assets/mash/favicon.ico ({', '.join(f'{s}x{s}' for s in ICO_SIZES)})")

    write_og_card(OUT_DIR / "og.png", OUT_DIR / "logo-mark@2x.png")
    print(f"wrote public/assets/mash/og.png ({OG_SIZE[0]}x{OG_SIZE[1]})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
