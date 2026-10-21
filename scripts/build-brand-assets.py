#!/usr/bin/env python3
"""Derive the site's Mash identity marks from the shipped artwork.

Source of truth: ../mash/branding/logo-solid.png (1024x1024, rounded square).
Outputs are committed under public/assets/mash/, so the site build never needs
the Mash repository present. Re-run this script only when the artwork changes.

Uses sips (macOS) for resampling and wraps PNGs into an ICO by hand: no Pillow.
"""

from __future__ import annotations

import shutil
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT.parent / "mash" / "branding" / "logo-solid.png"
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


def main() -> int:
    if not SOURCE.is_file():
        print(f"missing source artwork: {SOURCE}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
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
