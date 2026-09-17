from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Mobile-friendly dashboard keyboard with balanced button widths."""
    keyboard = [
        [
            KeyboardButton(text="📰 Свежий дайджест")
        ],
        [
            KeyboardButton(text="🚀 Полный запуск"),
            KeyboardButton(text="⚡ Сгенерировать")
        ],
        [
            KeyboardButton(text="🖥 Статус сервера"),
            KeyboardButton(text="🔌 Разбудить ПК")
        ]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        input_field_placeholder="Выберите действие..."
    )