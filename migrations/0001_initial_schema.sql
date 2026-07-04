-- 검단퍼스트치과 홈페이지 DB 스키마

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  privacy_agree INTEGER NOT NULL DEFAULT 0,
  marketing_agree INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 비포애프터
CREATE TABLE IF NOT EXISTS before_after (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  age_group TEXT,            -- 10대/20대/30대/40대/50대/60대/70대 이상
  gender TEXT,               -- 남성/여성
  category TEXT,             -- 진료 카테고리 slug
  region TEXT,               -- 지역 (예: 인천시 서구 원당동)
  doctor TEXT DEFAULT '김희수',
  duration TEXT,             -- 치료기간
  pano_before_key TEXT,      -- 파노라마 전
  pano_after_key TEXT,       -- 파노라마 후
  intra_before_key TEXT,     -- 구내포토 전
  intra_after_key TEXT,      -- 구내포토 후
  views INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ba_category ON before_after(category);
CREATE INDEX IF NOT EXISTS idx_ba_region ON before_after(region);

-- 블로그
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_html TEXT NOT NULL,
  excerpt TEXT,
  thumbnail_key TEXT,
  author TEXT DEFAULT '김희수 대표원장',
  category TEXT,
  views INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL,
  image_keys TEXT,           -- JSON array of R2 keys
  is_pinned INTEGER DEFAULT 0, -- 대장 공지
  views INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 설정 (관리자 비밀번호 등)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
