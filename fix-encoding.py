from pathlib import Path

files = list(Path("src").rglob("*.tsx")) + list(Path("src").rglob("*.ts"))

replacements = {
    "Ä°": "İ",
    "Ä±": "ı",
    "Ã‡": "Ç",
    "Ã§": "ç",
    "Ã–": "Ö",
    "Ã¶": "ö",
    "Ãœ": "Ü",
    "Ã¼": "ü",
    "Äž": "Ğ",
    "ÄŸ": "ğ",
    "Åž": "Ş",
    "ÅŸ": "ş",
    "â†": "←",
    "â‚º": "₺",
    "âœ…": "✅",
    "ðŸŽ®": "🎮",
    "ðŸ›¡ï¸": "🛡️",
    "ðŸ’°": "💰",
    "ðŸ’Ž": "💎",
    "ðŸ›’": "🛒",
    "âš”ï¸": "⚔️",
    "âš¡": "⚡",
    "ðŸ“¦": "📦",
    "ðŸ”¥": "🔥",
}

for file in files:
    text = file.read_text(encoding="utf-8", errors="ignore")
    old = text

    for bad, good in replacements.items():
        text = text.replace(bad, good)

    if text != old:
        file.write_text(text, encoding="utf-8")
        print("Duzeltildi:", file)

print("Bitti.")
