from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Mobile-friendly dashboard keyboard with balanced button widths."""
    keyboard = [
        [
            KeyboardButton(text="🚀 Run Full Pipeline"),
            KeyboardButton(text="⚡ Generate Digest")
        ],
        [
            KeyboardButton(text="🔌 Wake PC"),
            KeyboardButton(text="💤 Sleep PC")
        ],
        [
            KeyboardButton(text="💻 PC Status"),
            KeyboardButton(text="🖥 Server Status")
        ]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        input_field_placeholder="Choose an action..."
    )