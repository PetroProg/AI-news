import re

path = '/home/petroprog/Projects/news-ai/app/api.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update WORLD_POLITICS_INDICATORS to include space / science keywords
old_wp = '''    "военные нато случайно обстреляли"
]'''

new_wp = '''    "военные нато случайно обстреляли",
    "космос", "астроном", "магнетар", "телескоп", "nasa", "spacex", "starship", "орбита", "галактик", "вселенн", "экзопланет", "джеймс уэбб", "хаббл", "einstein probe"
]'''

if old_wp in content:
    content = content.replace(old_wp, new_wp)

# 2. Update resolution logic
old_block = '''        is_world_politics = (
            (raw_cat and any(k in raw_cat.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
            (any(k in title_lower for k in WORLD_POLITICS_INDICATORS) and not has_ukr_core)
        )

        is_gaming = any(k in source_combined for k in ["csgo", "cs3", "clashroyalepin", "hltv", "game", "киберспорт"]) or \\
                    any(k in title_lower for k in GAMING_INDICATORS)
        is_other_sports = any(k in title_lower for k in [
            "хокке", "нхл", "кхл", "овечкин", "шайб", " хк ",
            "теннис", "уимблдон", "ролан гаррос", "atp", "wta", "медведев", "джокович", "алькарас", "синнер",
            "баскетбол", "нба", "nba", "йокич", "леброн", "карри",
            "бокс", "ufc", "мма", "mma", "нокаут", "нфл", "корги"
        ])
        is_football = not is_gaming and not is_other_sports and (
            any(k in source_combined for k in ["sportsru", "sports.ru", "championat", "matchpremier", "sport-express", "fabrizio", "terrikon", "uefa", "футбол", "football"]) or
            (raw_cat and ("футбол" in raw_cat.lower() or "football" in raw_cat.lower())) or
            any(k in title_lower for k in FOOTBALL_INDICATORS)
        )
        is_f1 = any(k in source_combined for k in ["formula 1", "formula1", "f1", "формула-1"]) or \\
                (raw_cat and raw_cat.lower() == "f1") or \\
                any(k in title_lower for k in F1_INDICATORS)
        is_devops_linux = (
            any(k in source_combined for k in ["opennet", "devops", "linux"]) or
            (raw_cat and any(k in raw_cat.lower() for k in ["linux", "devops"])) or
            any(k in title_lower for k in ["ядро linux", "ubuntu", "debian", "arch linux", "kernel", "docker", "kubernetes", "k8s", "ansible"])
        )
        is_ukraine = not is_it_ai_offtopic and not is_world_politics and (
            any(k in source_combined for k in ["pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"]) or 
            (raw_cat and "украин" in raw_cat.lower())
        )

        if is_it_ai_offtopic:
            cat_name = "AI & Нейросети"
        elif is_world_politics:
            cat_name = "Мировая политика"'''

new_block = '''        is_ukr_source = any(k in source_combined for k in ["pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"])

        is_world = (
            (raw_cat and any(k in raw_cat.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
            (any(k in title_lower for k in WORLD_POLITICS_INDICATORS) and not has_ukr_core)
        )

        is_gaming = any(k in source_combined for k in ["csgo", "cs3", "clashroyalepin", "hltv", "game", "киберспорт"]) or \\
                    any(k in title_lower for k in GAMING_INDICATORS)
        is_other_sports = any(k in title_lower for k in [
            "хокке", "нхл", "кхл", "овечкин", "шайб", " хк ",
            "теннис", "уимблдон", "ролан гаррос", "atp", "wta", "медведев", "джокович", "алькарас", "синнер",
            "баскетбол", "нба", "nba", "йокич", "леброн", "карри",
            "бокс", "ufc", "мма", "mma", "нокаут", "нфл", "корги"
        ])
        is_football = not is_gaming and not is_other_sports and (
            any(k in source_combined for k in ["sportsru", "sports.ru", "championat", "matchpremier", "sport-express", "fabrizio", "terrikon", "uefa", "футбол", "football"]) or
            (raw_cat and ("футбол" in raw_cat.lower() or "football" in raw_cat.lower())) or
            any(k in title_lower for k in FOOTBALL_INDICATORS)
        )
        is_f1 = any(k in source_combined for k in ["formula 1", "formula1", "f1", "формула-1"]) or \\
                (raw_cat and raw_cat.lower() == "f1") or \\
                any(k in title_lower for k in F1_INDICATORS)
        is_devops_linux = (
            any(k in source_combined for k in ["opennet", "devops", "linux"]) or
            (raw_cat and any(k in raw_cat.lower() for k in ["linux", "devops"])) or
            any(k in title_lower for k in ["ядро linux", "ubuntu", "debian", "arch linux", "kernel", "docker", "kubernetes", "k8s", "ansible"])
        )
        is_ukraine = not is_it_ai_offtopic and not is_world and (
            is_ukr_source or 
            (raw_cat and "украин" in raw_cat.lower() and (has_ukr_core or is_ukr_source))
        )

        # Fallback guard: non-ukrainian news tagged as Ukraine -> 'Мир'
        if not is_ukraine and not is_world and raw_cat and "украин" in raw_cat.lower() and not has_ukr_core and not is_ukr_source:
            is_world = True

        if is_it_ai_offtopic:
            cat_name = "AI & Нейросети"
        elif is_world:
            cat_name = "Мир"'''

if old_block in content:
    content = content.replace(old_block, new_block)

# 3. Fallback check at line 1034
content = content.replace(
    'if any(k in raw_cat.lower() for k in ["мировая политика", "политика", "мир", "world"]):\n                cat_name = "Мировая политика"',
    'if any(k in raw_cat.lower() for k in ["мировая политика", "политика", "мир", "world"]):\n                cat_name = "Мир"'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app/api.py successfully!")
