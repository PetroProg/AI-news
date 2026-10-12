path = '/home/petroprog/Projects/news-ai/app/services/report.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '"МИРОВАЯ ПОЛИТИКА": "🌍",',
    '"МИР": "🌍",\n            "МИРОВАЯ ПОЛИТИКА": "🌍",'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app/services/report.py successfully!")
