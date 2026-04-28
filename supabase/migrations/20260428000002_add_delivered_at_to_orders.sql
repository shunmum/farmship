-- 配送済みになった日時を記録するカラムを追加
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- 既存の「配送済み」レコードは記録なし（NULLのまま）
