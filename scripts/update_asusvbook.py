import sys
sys.path.insert(0, '/app')
import asyncio
from sqlalchemy import text
from app.database.session import async_session_maker

async def main():
    async with async_session_maker() as session:
        query = text("""
            UPDATE managed_devices
            SET key_id = 'asusvbook',
                name = 'AsusVBook',
                category = 'computers',
                icon = 'laptop',
                vendor = 'ASUS VivoBook (Windows 11)',
                location = 'Мобильный',
                ip = '192.168.178.75',
                tailscale_ip = '100.101.184.122',
                mac = '9C:C7:D3:AF:48:7C',
                connection = 'Wi-Fi 6',
                notes = 'Новый ноутбук AsusVBook'
            WHERE id = 5;
        """)
        await session.execute(query)
        await session.commit()
        print("Successfully updated managed_devices with AsusVBook!")

if __name__ == '__main__':
    asyncio.run(main())
