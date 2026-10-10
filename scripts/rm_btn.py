import sys
import re

path = '/home/petroprog/Projects/news-ai/app/bot/keyboards.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the block containing the button
new_content = re.sub(
    r'\s*\[\s*KeyboardButton\(text="📰 Свежий дайджест"\)\s*\],\s*',
    '\n        ',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Removed 'Свежий дайджест' button from keyboard!")
