from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton

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
        ],
        [
            KeyboardButton(text="🐳 Containers")
        ]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        input_field_placeholder="Choose an action..."
    )


def get_containers_inline_keyboard() -> InlineKeyboardMarkup:
    """Inline keyboard for refreshing the container list."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🔄 Refresh Status", callback_data="refresh_containers")
            ]
        ]
    )