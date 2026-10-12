import re

path = '/home/petroprog/Projects/news-ai/app/services/summarizer.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace world_politics_indicators and following routing logic
old_block = '''            world_politics_indicators = [
                "трамп", "trump", "байден", "biden", "харрис", "harris", "пентагон", "белый дом",
                "конгресс сша", "сенат сша", "new york times", "politico", "республиканц", "демократ",
                "макрон", "шольц", "мерц", "бундестаг", "стармер", "великобритани", "франци", "германи",
                "орбан", "венгри", "фицо", "словаки", "вучич", "серби", "белград", "израиль", "нетаньяху",
                "сектор газа", "хамас", "хезболла", "ливан", "бейрут", " иран", "ирана", "иране", "ирану", "ираном", "иранск",
                "тегеран", "пезешкиан", "китай", "пекин", "си цзиньпин", "тайвань", "кндр", "северная корея", "южная корея",
                "пхеньян", "сеул", "ким чен", "египет", "датск", "дания ", " дании", "рубио", "госдеп", "латви", "чехия", "чешск", "чехии"
            ]

            has_ukr_core = any(k in title_lower or k in content_lower for k in ukr_core_indicators)

            is_world_politics = (
                (analysis.category and any(k in analysis.category.lower() for k in ["мировая политика", "политика", "мир", "world"])) or
                (any(k in title_lower for k in world_politics_indicators) and not has_ukr_core)
            )

            is_ukraine = not is_world_politics and (
                ("novynaukr" in combined_source) or 
                (analysis.category and "украин" in analysis.category.lower())
            )

            is_swiss = any(acc in combined_source for acc in ["rtsinfo", "rtsarchives", "blick_media", "20minutesonline", "instagram"]) or \\
                       (analysis.category and "swiss" in analysis.category.lower())

            if is_swiss:
                chosen_category = "Swiss"
            elif is_world_politics:
                chosen_category = "Мировая политика"'''

new_block = '''            world_politics_indicators = [
                "трамп", "trump", "байден", "biden", "харрис", "harris", "пентагон", "белый дом",
                "конгресс сша", "сенат сша", "new york times", "politico", "республиканц", "демократ",
                "макрон", "шольц", "мерц", "бундестаг", "стармер", "великобритани", "франци", "германи",
                "орбан", "венгри", "фицо", "словаки", "вучич", "серби", "белград", "израиль", "нетаньяху",
                "сектор газа", "хамас", "хезболла", "ливан", "бейрут", " иран", "ирана", "иране", "ирану", "ираном", "иранск",
                "тегеран", "пезешкиан", "китай", "пекин", "си цзиньпин", "тайвань", "кндр", "северная корея", "южная корея",
                "пхеньян", "сеул", "ким чен", "египет", "датск", "дания ", " дании", "рубио", "госдеп", "латви", "чехия", "чешск", "чехии",
                "космос", "астроном", "магнетар", "телескоп", "nasa", "spacex", "starship", "орбита", "галактик", "вселенн", "экзопланет", "джеймс уэбб", "хаббл", "einstein probe"
            ]

            has_ukr_core = any(k in title_lower or k in content_lower for k in ukr_core_indicators)
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
                chosen_category = "Мир"'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated app/services/summarizer.py successfully!")
else:
    print("Could not find exact block in app/services/summarizer.py")
