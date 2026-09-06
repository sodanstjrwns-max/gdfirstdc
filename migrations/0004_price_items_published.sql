-- 0004: 수가 항목별 공개/비공개 토글
-- 기존 항목은 모두 공개(1)로 유지 — 데이터 손실 없음
ALTER TABLE price_items ADD COLUMN is_published INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_price_items_pub ON price_items(is_published);
