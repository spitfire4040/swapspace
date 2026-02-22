CREATE TABLE IF NOT EXISTS swipes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_id   UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  direction  TEXT NOT NULL CHECK (direction IN ('like', 'skip')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, photo_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_user_id  ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_photo_id ON swipes(photo_id);
