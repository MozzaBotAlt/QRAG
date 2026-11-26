CREATE TABLE IF NOT EXISTS artworks (
  qr_id TEXT PRIMARY KEY,
  title VARCHAR(160) NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 5000),
  image_url TEXT NOT NULL CHECK (image_url ~ '^https://'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artworks_created_at_idx
  ON artworks (created_at DESC);
