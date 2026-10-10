import sys
import re

path = '/home/petroprog/Projects/news-ai/app/services/report.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'cat_icons = \{.*?\}'

new_dict = '''cat_icons = {
            "УКРАИНА": "🇺🇦",
            "SWISS": "🇨🇭",
            "ШВЕЙЦАР": "🇨🇭",
            "LINUX": "🐧",
            "DEV": "💻",
            "DEVELOPMENT": "💻",
            "IT": "💻",
            "CS2": "🎮",
            "CS": "🎮",
            "GAMING": "🎮",
            "CYBERSPORT": "🎮",
            "AI": "🤖",
            "КИБЕРБЕЗОПАСНОСТЬ": "🛡",
            "SECURITY": "🛡",
            "TECH": "⚡",
            "F1": "🏎️",
            "ФОРМУЛА": "🏎️",
            "ФУТБОЛ": "⚽",
            "МИРОВАЯ ПОЛИТИКА": "🌍",
        }'''

content = re.sub(pattern, new_dict, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Rebuilt cat_icons completely without encoding loss!")
