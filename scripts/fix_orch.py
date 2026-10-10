import sys

path = '/home/petroprog/Projects/news-ai/app/services/orchestrator.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_line_217 = '                                    text=f"⚠️ *Видеокарта нагружена на {gpu_load}%*. Вероятно, вы играете.\\nОткладываю суммаризацию на 1 час...",\n'
new_line_230 = '                            text="🟢 *GPU-нода подключена и свободна!* Начинаю суммаризацию на RTX 3060...",\n'

for i, line in enumerate(lines):
    if 'Вероятно, вы играете' in line:
        lines[i] = new_line_217
    elif 'GPU-нода подключена и свободна' in line:
        lines[i] = new_line_230

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Fixed orchestrator lines perfectly!")
