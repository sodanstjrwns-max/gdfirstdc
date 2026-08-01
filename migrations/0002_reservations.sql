-- 예약/상담 신청
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT,               -- 진료 항목 (라벨 텍스트)
  preferred_at TEXT,           -- 희망 날짜·시간 (자유 텍스트)
  message TEXT,                -- 문의 내용
  status TEXT NOT NULL DEFAULT 'new',  -- new(신규) / contacted(연락완료) / confirmed(예약확정) / cancelled(취소)
  privacy_agree INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at);
