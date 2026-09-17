from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Main dashboard keyboard with quick action buttons."""
    keyboard = [
        [
            KeyboardButton(text="📰 Свежий дайджест"),
            KeyboardButton(text="⚡ Сгенерировать сейчас")
        ],
        [
            KeyboardButton(text="🖥 Статус сервера"),
            KeyboardButton(text="🔌 Разбудить ПК (WoL)")
        ]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        input_field_placeholder="Выберите действие..."
    )