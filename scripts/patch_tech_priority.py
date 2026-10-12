import re

# 1. Patch app/api.py
api_path = '/home/petroprog/Projects/news-ai/app/api.py'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

tech_indicators_code = '''TECH_INDICATORS = [
    "смартфон", "телефон", "складн", "айфон", "iphone", "ipad", "macbook",
    "huawei", "xiaomi", "samsung", "honor", "vivo", "oppo", "realme", "oneplus", "pixel",
    "гаджет", "девайс", "планшет", "умные часы", "смарт-час", "смарт-очк", "наушник",
    "ноутбук", "процессор", "видеокарт", "чип", "geforce", "radeon", "rtx", "gtx",
    "intel", "amd", "nvidia", "qualcomm", "snapdragon", "exynos", "mediatek", "dimensity",
    "материнск", "монитор", "дисплей", "oled", "amoled", "экран", "ссд", "ssd", "железо",
    "кулер", "аккумулятор", "батаре", "зарядк", "робот", "робототехник", "boston dynamics",
    "figure 0", "tesla bot", "optimus", "playstation", "xbox", "nintendo", "рынок смартфонов",
    "рынок пк", "флагманск", "камера"
]

'''

if 'TECH_INDICATORS =' not in api_content:
    api_content = api_content.replace('WORLD_POLITICS_INDICATORS = [', tech_indicators_code + 'WORLD_POLITICS_INDICATORS = [')

old_api_resolution = '''        is_ukr_source = any(k in source_combined for k in ["pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"])

        is_world = (
            (raw_cat and any(k in raw_cat.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
            (any(k in title_lower for k in WORLD_POLITICS_INDICATORS) and not has_ukr_core)
        )'''

new_api_resolution = '''        is_ukr_source = any(k in source_combined for k in ["pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"])

        is_tech = (
            (raw_cat and any(k in raw_cat.lower() for k in ["технолог", "technology", "гаджет", "девайс", "железо"])) or
            any(k in title_lower for k in TECH_INDICATORS)
        )

        is_world = not is_tech and (
            (raw_cat and any(k in raw_cat.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
            (any(k in title_lower for k in WORLD_POLITICS_INDICATORS) and not has_ukr_core)
        )'''

api_content = api_content.replace(old_api_resolution, new_api_resolution)

old_api_branches = '''        if is_it_ai_offtopic:
            cat_name = "AI & Нейросети"
        elif is_world:
            cat_name = "Мир"
        elif is_football:
            cat_name = "Футбол"
        elif is_f1:
            cat_name = "F1"
        elif is_devops_linux:
            cat_name = "DevOps & Linux"
        elif is_ukraine:
            cat_name = "Украина"
        elif is_gaming:
            cat_name = "CS2"'''

new_api_branches = '''        if is_it_ai_offtopic:
            cat_name = "AI & Нейросети"
        elif is_football:
            cat_name = "Футбол"
        elif is_f1:
            cat_name = "F1"
        elif is_gaming:
            cat_name = "CS2"
        elif is_devops_linux:
            cat_name = "DevOps & Linux"
        elif is_tech:
            cat_name = "Технологии"
        elif is_world:
            cat_name = "Мир"
        elif is_ukraine:
            cat_name = "Украина"'''

api_content = api_content.replace(old_api_branches, new_api_branches)

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(api_content)
print("Updated app/api.py successfully!")


# 2. Patch app/services/summarizer.py
sum_path = '/home/petroprog/Projects/news-ai/app/services/summarizer.py'
with open(sum_path, 'r', encoding='utf-8') as f:
    sum_content = f.read()

old_sum_block = '''            has_ukr_core = any(k in title_lower or k in content_lower for k in ukr_core_indicators)
            is_ukr_source = any(k in combined_source for k in ["pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"])

            is_world = (
                (analysis.category and any(k in analysis.category.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
                (any(k in title_lower for k in world_politics_indicators) and not has_ukr_core)
            )

            is_ukraine = not is_world and (
                ("novynaukr" in combined_source) or 
                (analysis.category and "украин" in analysis.category.lower() and (has_ukr_core or is_ukr_source))
            )

            # Safety guard: if LLM categorized as Ukraine but it has NO Ukraine indicators and source is NOT Ukrainian -> route to 'Мир'
            if not is_ukraine and not is_world and (analysis.category and "украин" in analysis.category.lower()) and not has_ukr_core and not is_ukr_source:
                is_world = True

            is_swiss = any(acc in combined_source for acc in ["rtsinfo", "rtsarchives", "blick_media", "20minutesonline", "instagram"]) or \\
                       (analysis.category and "swiss" in analysis.category.lower())

            if is_swiss:
                chosen_category = "Swiss"
            elif is_world:
                chosen_category = "Мир"
            elif is_ukraine:
                chosen_category = "Украина"
            elif is_gaming or (analysis.category and analysis.category.lower() in ["игры & киберспорт", "игры и киберспорт", "gaming", "cs2"]):
                chosen_category = "CS2"
            elif (analysis.category and any(k in analysis.category.lower() for k in ["linux", "devops", "opennet", "инфраструктур", "сервер"])) or ("opennet" in combined_source):
                chosen_category = "DevOps & Linux"
            elif (analysis.category and any(k in analysis.category.lower() for k in ["ai", "нейро", "интеллект", "llm", "машинн", "ml"])) or ("huggingface" in combined_source):
                chosen_category = "AI & Нейросети"
            elif (analysis.category and any(k in analysis.category.lower() for k in ["технолог", "technology", "робот", "robot", "гаджет", "gadget", "железо", "hardware"])) or any(k in title_lower for k in ["робот", "figure 0", "boston dynamics"]):
                chosen_category = "Технологии"'''

new_sum_block = '''            has_ukr_core = any(k in title_lower or k in content_lower for k in ukr_core_indicators)
            is_ukr_source = any(k in combined_source for k in ["pravda.com.ua", "liga.net", "novynaukr", "украин", "украина", "україна"])

            is_tech = (
                (analysis.category and any(k in analysis.category.lower() for k in ["технолог", "technology", "робот", "robot", "гаджет", "gadget", "железо", "hardware"])) or
                any(k in title_lower for k in [
                    "смартфон", "телефон", "складн", "айфон", "iphone", "ipad", "macbook",
                    "huawei", "xiaomi", "samsung", "honor", "vivo", "oppo", "realme", "oneplus", "pixel",
                    "гаджет", "девайс", "планшет", "умные часы", "смарт-час", "смарт-очк", "наушник",
                    "ноутбук", "процессор", "видеокарт", "чип", "geforce", "radeon", "rtx", "gtx",
                    "intel", "amd", "nvidia", "qualcomm", "snapdragon", "exynos", "mediatek", "dimensity",
                    "материнск", "монитор", "дисплей", "oled", "amoled", "экран", "ссд", "ssd",
                    "железо", "кулер", "аккумулятор", "батаре", "зарядк", "робот", "робототехник",
                    "boston dynamics", "figure 0", "tesla bot", "optimus", "playstation", "xbox", "nintendo",
                    "рынок смартфонов", "рынок пк", "флагманск", "камера"
                ])
            )

            is_world = not is_tech and (
                (analysis.category and any(k in analysis.category.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
                (any(k in title_lower for k in world_politics_indicators) and not has_ukr_core)
            )

            is_ukraine = not is_world and not is_tech and (
                ("novynaukr" in combined_source) or 
                (analysis.category and "украин" in analysis.category.lower() and (has_ukr_core or is_ukr_source))
            )

            # Safety guard: if LLM categorized as Ukraine but it has NO Ukraine indicators and source is NOT Ukrainian -> route to 'Мир' or 'Технологии'
            if not is_ukraine and not is_world and not is_tech and (analysis.category and "украин" in analysis.category.lower()) and not has_ukr_core and not is_ukr_source:
                is_world = True

            is_swiss = any(acc in combined_source for acc in ["rtsinfo", "rtsarchives", "blick_media", "20minutesonline", "instagram"]) or \\
                       (analysis.category and "swiss" in analysis.category.lower())

            if is_swiss:
                chosen_category = "Swiss"
            elif is_gaming or (analysis.category and analysis.category.lower() in ["игры & киберспорт", "игры и киберспорт", "gaming", "cs2"]):
                chosen_category = "CS2"
            elif (analysis.category and any(k in analysis.category.lower() for k in ["ai", "нейро", "интеллект", "llm", "машинн", "ml"])) or ("huggingface" in combined_source):
                chosen_category = "AI & Нейросети"
            elif (analysis.category and any(k in analysis.category.lower() for k in ["linux", "devops", "opennet", "инфраструктур", "сервер"])) or ("opennet" in combined_source):
                chosen_category = "DevOps & Linux"
            elif is_tech:
                chosen_category = "Технологии"
            elif is_world:
                chosen_category = "Мир"
            elif is_ukraine:
                chosen_category = "Украина"'''

if old_sum_block in sum_content:
    sum_content = sum_content.replace(old_sum_block, new_sum_block)
    with open(sum_path, 'w', encoding='utf-8') as f:
        f.write(sum_content)
    print("Updated app/services/summarizer.py successfully!")
else:
    print("Could not find old_sum_block in summarizer.py")


# 3. Patch web/js/app.js
appjs_path = '/home/petroprog/Projects/news-ai/web/js/app.js'
with open(appjs_path, 'r', encoding='utf-8') as f:
    appjs_content = f.read()

old_appjs_check = """      const lower = c.toLowerCase();
      if (lower.includes('мировая политика') || lower.includes('политик') || lower.includes('мир') || lower.includes('world')) {
        return 'Мир';
      }
      if (lower.includes('технолог') || lower.includes('technology') || lower.includes('робот') || lower.includes('robot')) {
        return 'Технологии';
      }"""

new_appjs_check = """      const lower = c.toLowerCase();
      const isTech = ['смартфон', 'телефон', 'складн', 'айфон', 'iphone', 'ipad', 'macbook', 'huawei', 'xiaomi', 'samsung', 'honor', 'vivo', 'oppo', 'realme', 'oneplus', 'pixel', 'гаджет', 'девайс', 'планшет', 'умные часы', 'смарт-час', 'наушник', 'ноутбук', 'процессор', 'видеокарт', 'чип', 'geforce', 'radeon', 'rtx', 'gtx', 'intel', 'amd', 'nvidia', 'qualcomm', 'snapdragon', 'дисплей', 'oled', 'amoled', 'экран', 'ссд', 'ssd', 'железо', 'робот', 'boston dynamics', 'флагманск', 'камера'].some(k => t.includes(k) || (rawCat && rawCat.toLowerCase().includes(k)));

      if (isTech || lower.includes('технолог') || lower.includes('technology') || lower.includes('робот') || lower.includes('robot')) {
        return 'Технологии';
      }
      if (lower.includes('мировая политика') || lower.includes('политик') || lower.includes('мир') || lower.includes('world')) {
        return 'Мир';
      }"""

if old_appjs_check in appjs_content:
    appjs_content = appjs_content.replace(old_appjs_check, new_appjs_check)
    with open(appjs_path, 'w', encoding='utf-8') as f:
        f.write(appjs_content)
    print("Updated web/js/app.js successfully!")
else:
    print("Could not find old_appjs_check in app.js")
