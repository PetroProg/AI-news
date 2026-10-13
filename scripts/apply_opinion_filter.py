import re

# 1. Patch app/ai/client.py
client_path = '/home/petroprog/Projects/news-ai/app/ai/client.py'
with open(client_path, 'r', encoding='utf-8') as f:
    client_content = f.read()

old_f1_prompt = '"- \'F1\': Формула-1, автоспорт, гонки, пилоты (Верстаппен, Хэмилтон, Леклер, Норрис), команды (Red Bull, Ferrari, Mercedes, McLaren), Гран-при, квалификации, спринты.\\n"'
new_f1_prompt = '"- \'F1\': Формула-1, автоспорт, гонки, пилоты (Верстаппен, Хэмилтон, Леклер, Норрис), команды (Red Bull, Ferrari, Mercedes, McLaren), Гран-при, квалификации, спринты. ВАЖНО: оценивай высоко (7.5-9.5) ТОЛЬКО реальные ключевые события: результаты квалификаций и гонок (победители, поул, подиум), официальные штрафы FIA, дисквалификации, официальные трансферы пилотов, технические сходы/аварии лидеров. СУБЪЕКТИВНЫМ авторским колонкам, рассуждениям обозревателей, рейтингам и спискам (\'5 победителей и проигравших\', \'Power Rankings\', \'советы беттерам\') СТРОГО ставь важность 1.5 - 3.0!\\n"'

client_content = client_content.replace(old_f1_prompt, new_f1_prompt)

old_importance = '"- 1.0 - 4.0 (МЕЛКОЕ / САРКАЗМ / МЕМЫ / РОФЛЫ): сарказм, ирония, шуточные посты, рофлы, мемы, курьезные игровые моменты и фейлы в раундах матчей (например, игрок случайно разбился, затимкиллил, неудачный клатч, фразы вроде \'случайно перешел за соперника\', \'помог врагам\', киллфиды, стримерские приколы, розыгрыши скинов). ВАЖНО: никогда не воспринимай сарказм и шуточные посты за чистую монету! Ставь им строго score от 1.0 до 3.5!\\n"'
new_importance = '"- 1.0 - 4.0 (МЕЛКОЕ / САРКАЗМ / МЕМЫ / СУБЪЕКТИВНЫЕ КОЛОНКИ / БЕЗ КОНТЕКСТА): сарказм, ирония, шуточные посты, рофлы, мемы, курьезные игровые моменты; субъективные авторские колонки мнений и списки без четких фактов и контекста (например: \'X победителей и проигравших\', \'Power Rankings / Рейтинги силы\', \'Кто впечатлил / разочаровал\', \'Уроки для беттеров / советы по ставкам\', рассуждения отдельных журналистов \'по мнению кого-то\'); новости без конкретной фактуры или контекста. ВАЖНО: статьям без конкретных фактов и контекста СТРОГО ставь score от 1.5 до 3.5!\\n"'

client_content = client_content.replace(old_importance, new_importance)

old_summary_req = '"- short_summary: 1-2 кратких емких предложения сути на русском языке. Если новость шуточная или саркастичная — явно укажи, что это курьёз/шутка.\\n"'
new_summary_req = '"- short_summary: 1-2 кратких емких предложения сути с КОНКРЕТНЫМИ ФАКТАМИ на русском языке. Запрещено писать размытые мета-фразы без контекста вроде \'Пилоты и команды, которые по мнению кого-то...\'. Если новость шуточная или саркастичная — явно укажи, что это курьёз/шутка.\\n"'

client_content = client_content.replace(old_summary_req, new_summary_req)

with open(client_path, 'w', encoding='utf-8') as f:
    f.write(client_content)
print("Updated app/ai/client.py successfully!")


# 2. Patch app/services/summarizer.py
sum_path = '/home/petroprog/Projects/news-ai/app/services/summarizer.py'
with open(sum_path, 'r', encoding='utf-8') as f:
    sum_content = f.read()

# Priority weight penalty
old_weight = '        def article_priority_weight(a: Article) -> int:\n            t = ((a.title or "") + " " + (a.raw_content or "")).lower()\n'
new_weight = '        def article_priority_weight(a: Article) -> int:\n            t = ((a.title or "") + " " + (a.raw_content or "")).lower()\n            if any(op in t for op in ["winners and losers", "winners & losers", "победители и проигравшие", "победителей и проигравших", "power rankings", "беттер", "ставки на", "лучшие и худшие"]):\n                return -50\n'

sum_content = sum_content.replace(old_weight, new_weight)

# Score reduction
old_meme_check = '''            if is_meme_or_ad and score > 4.0:
                score = 3.0
                logger.info("Article ID %d detected as meme/ad/sarcasm. Reduced score to %.1f", article.id, score)'''

new_meme_check = '''            if is_meme_or_ad and score > 4.0:
                score = 3.0
                logger.info("Article ID %d detected as meme/ad/sarcasm. Reduced score to %.1f", article.id, score)

            OPINION_LISTICLE_STOPS = [
                "победители и проигравшие", "победителей и проигравших", "winners and losers", "winners & losers",
                "power rankings", "рейтинг силы", "рейтинги силы", "кто впечатлил", "кто разочаровал",
                "уроки для беттеров", "уроков для беттеров", "для беттеров", "ставки на", "советы по ставкам",
                "лучшие и худшие", "худшие и лучшие", "who impressed", "takeaways from", "главные выводы",
                "итоги уикенда от", "по мнению lawrence", "по мнению обозревателя", "по мнению журналиста",
                "season ticket", "southwell", "hereford", "wolverhampton"
            ]
            sum_lower = (analysis.short_summary or "").lower()
            is_opinion_or_listicle = any(stop in text_for_check for stop in OPINION_LISTICLE_STOPS) or \\
                                     any(stop in sum_lower for stop in ["по мнению lawrence", "по мнению обозревателя", "по мнению журналиста", "выиграли и проиграли на"])
            if is_opinion_or_listicle:
                score = min(score, 3.0)
                logger.info("Article ID %d detected as subjective opinion/listicle without context. Reduced score to %.1f", article.id, score)'''

sum_content = sum_content.replace(old_meme_check, new_meme_check)

with open(sum_path, 'w', encoding='utf-8') as f:
    f.write(sum_content)
print("Updated app/services/summarizer.py successfully!")


# 3. Patch app/services/orchestrator.py
orch_path = '/home/petroprog/Projects/news-ai/app/services/orchestrator.py'
with open(orch_path, 'r', encoding='utf-8') as f:
    orch_content = f.read()

orch_content = orch_content.replace(
    '("SkySports Football", "https://www.skysports.com/rss/12040"),',
    '("SkySports Football", "https://www.skysports.com/rss/12010"),'
)

with open(orch_path, 'w', encoding='utf-8') as f:
    f.write(orch_content)
print("Updated app/services/orchestrator.py successfully!")


# 4. Patch app/api.py
api_path = '/home/petroprog/Projects/news-ai/app/api.py'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

old_api_meme = '''        score = float(art.importance_score or 7.0)
        if is_operational_alert:
            score = min(score, 5.0)
        elif is_meme_or_ad and score > 4.0:
            score = 3.0'''

new_api_meme = '''        score = float(art.importance_score or 7.0)
        OPINION_LISTICLE_STOPS = [
            "победители и проигравшие", "победителей и проигравших", "winners and losers", "winners & losers",
            "power rankings", "рейтинг силы", "рейтинги силы", "кто впечатлил", "кто разочаровал",
            "уроки для беттеров", "уроков для беттеров", "для беттеров", "ставки на", "советы по ставкам",
            "лучшие и худшие", "худшие и лучшие", "who impressed", "takeaways from", "главные выводы",
            "итоги уикенда от", "по мнению lawrence", "southwell", "hereford", "wolverhampton", "season ticket"
        ]
        sum_lower = (art.summary.short_summary.lower() if art.summary and art.summary.short_summary else "")
        is_opinion_or_listicle = any(stop in text_for_check for stop in OPINION_LISTICLE_STOPS) or \\
                                 any(stop in sum_lower for stop in ["по мнению lawrence", "по мнению обозревателя", "по мнению журналиста", "выиграли и проиграли на"])
        if is_opinion_or_listicle:
            score = 3.0
        elif is_operational_alert:
            score = min(score, 5.0)
        elif is_meme_or_ad and score > 4.0:
            score = 3.0'''

api_content = api_content.replace(old_api_meme, new_api_meme)

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(api_content)
print("Updated app/api.py successfully!")


# 5. Patch web/js/app.js
appjs_path = '/home/petroprog/Projects/news-ai/web/js/app.js'
with open(appjs_path, 'r', encoding='utf-8') as f:
    appjs_content = f.read()

old_appjs_filter = '''      const score = item.importance_score ? Number(item.importance_score) : 0;

      // Strict user constraint: News below 5.1 are not interesting
      if (score < 5.1) {
        return false;
      }'''

new_appjs_filter = '''      const score = item.importance_score ? Number(item.importance_score) : 0;

      // Strict user constraint: News below 5.1 are not interesting
      if (score < 5.1) {
        return false;
      }

      // Filter out subjective opinion pieces, listicles, betting advice, or columns without substance
      const summaryText = String(item.summary || item.short_summary || (item.summaries && (item.summaries.ru || item.summaries.en)) || '').toLowerCase();
      const isOpinionListicle = [
        'победители и проигравшие', 'победителей и проигравших', 'winners and losers', 'winners & losers',
        'power rankings', 'рейтинг силы', 'кто впечатлил', 'кто разочаровал', 'уроки для беттеров',
        'уроков для беттеров', 'для беттеров', 'советы по ставкам', 'лучшие и худшие', 'худшие и лучшие',
        'season ticket', 'southwell', 'hereford'
      ].some(k => rawTitle.includes(k) || summaryText.includes(k));
      if (isOpinionListicle) {
        return false;
      }'''

appjs_content = appjs_content.replace(old_appjs_filter, new_appjs_filter)

with open(appjs_path, 'w', encoding='utf-8') as f:
    f.write(appjs_content)
print("Updated web/js/app.js successfully!")


# 6. Bump cache in web/index.html
html_path = '/home/petroprog/Projects/news-ai/web/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = re.sub(
    r'js/app\.js\?v=[^\'"]+',
    'js/app.js?v=2026_10_13_no_opinion_v23',
    html_content
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
print("Updated web/index.html successfully!")
