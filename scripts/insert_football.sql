INSERT INTO categories (name, slug, description, is_favorite)
VALUES ('Футбол', 'football', 'Футбол: Ла Лига, Лига Чемпионов, Лига Европы, Лига Наций, Месси, Барселона, Интер Майами', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO sources (name, url, source_type, is_active, fetch_interval_minutes)
VALUES 
  ('Marca: Primera Division', 'https://objetos.estaticos-marca.com/rss/futbol/primera-division.xml', 'rss', true, 30),
  ('AS: Primera Division', 'https://as.com/rss/futbol/primera.xml', 'rss', true, 30),
  ('Telegram: @sportsru', 'https://t.me/sportsru', 'telegram', true, 15),
  ('Telegram: @sportsru_football', 'https://t.me/sportsru_football', 'telegram', true, 15),
  ('Telegram: @fabriziorom', 'https://t.me/fabriziorom', 'telegram', true, 15)
ON CONFLICT DO NOTHING;
