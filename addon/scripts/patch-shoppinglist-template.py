#!/usr/bin/env python3
"""Patch Grocy shopping list template to preserve backend-computed totals."""

from __future__ import annotations

import argparse
from pathlib import Path


OLD = "$listItem->last_price_total = $listItem->price * $listItem->amount;"
NEW = "$listItem->last_price_total = $listItem->last_price_total ?? ($listItem->price * $listItem->amount);"


def patch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if NEW in text:
        return False
    if OLD not in text:
        raise SystemExit(f"Expected line not found in {path}")
    path.write_text(text.replace(OLD, NEW), encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path",
        default="/app/www/views/shoppinglist.blade.php",
        help="Path to shoppinglist.blade.php",
    )
    args = parser.parse_args()
    target = Path(args.path)
    if not target.exists():
        raise SystemExit(f"Template not found: {target}")
    changed = patch(target)
    print("patched" if changed else "already-patched")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
