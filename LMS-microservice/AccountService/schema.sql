-- Định nghĩa vai trò người dùng
CREATE TYPE user_role AS ENUM ('ADMIN', 'LECTURER', 'STUDENT', 'GUEST');

-- Định nghĩa trạng thái tài khoản
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING');

-- ==========================================
-- 1. TẠO BẢNG CHÍNH (Phải tạo đầu tiên)
-- ==========================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),              -- Đã bỏ NOT NULL để INSERT không bị lỗi
    role VARCHAR(50) DEFAULT 'student',
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ĐÃ THÊM CỘT STATUS VÀO ĐÂY
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm nhanh theo email (phục vụ Login)
CREATE INDEX idx_users_email ON users(email);


-- ==========================================
-- 2. TẠO CÁC BẢNG PHỤ (Có khóa ngoại trỏ về bảng chính)
-- ==========================================

-- Bảng lưu liên kết mạng xã hội (Google, Facebook...)
CREATE TABLE user_providers (
    id SERIAL PRIMARY KEY, 
    user_id BIGINT NOT NULL, -- Khớp 100% với BIGINT của users(id)
    provider_name VARCHAR(100) NOT NULL, 
    provider_user_id VARCHAR(255) NOT NULL, 
    access_token VARCHAR(255), 
    refresh_token VARCHAR(255), 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_providers_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_provider_user UNIQUE (provider_name, provider_user_id)
);

CREATE INDEX idx_user_providers_lookup ON user_providers(provider_name, provider_user_id);


-- Bảng lưu Refresh Token (phục vụ JWT)
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Khớp 100% với BIGINT của users(id)
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_tokens FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tokens_user_id ON refresh_tokens(user_id);


-- Bảng lưu mã đặt lại mật khẩu
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Khớp 100% với BIGINT của users(id)
    reset_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_reset FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);
-- Create ENUM type for action
CREATE TYPE audit_action_enum AS ENUM (
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'ROLE_CHANGE',
  'PASSWORD_CHANGE',
  'ACCOUNT_DISABLE'
);

-- Create table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,       -- Dùng BIGSERIAL để tự tăng (khuyên dùng)
    user_id VARCHAR(255),           -- Soft reference: no FK (Mẹo: Nếu lưu ID thật của user thì nên đổi luôn thành BIGINT cho đồng bộ)
    email VARCHAR(255),             -- Store email for audit trail
    target_user_id BIGINT,          -- 🛠️ SỬA Ở ĐÂY: Đổi UUID thành BIGINT để khớp với bảng users
    action audit_action_enum NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Only FK for target_user_id
    CONSTRAINT fk_audit_target 
        FOREIGN KEY (target_user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);


CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Bảng users giả sử có id BIGSERIAL PRIMARY KEY
-- Ta chèn dữ liệu với id cố định để khớp với lecturers

INSERT INTO users (id, email, password_hash, role, status, is_active)
VALUES
(1001, 'nguyenthanhan@lecturer.tdtu.edu.vn', crypt('hashed_lecturer_pw', gen_salt('bf', 10)), 'LECTURER', 'ACTIVE', TRUE),
(1002, 'dungcamquang@lecturer.tdtu.edu.vn', crypt('hashed_lecturer_pw', gen_salt('bf', 10)), 'LECTURER', 'ACTIVE', TRUE),
(1003, 'truongdinhtu@lecturer.tdtu.edu.vn', crypt('hashed_lecturer_pw', gen_salt('bf', 10)), 'LECTURER', 'ACTIVE', TRUE),
(1004, 'levanvang@lecturer.tdtu.edu.vn', crypt('hashed_lecturer_pw', gen_salt('bf', 10)), 'LECTURER', 'ACTIVE', TRUE),
(2001, 'admin@example.com', crypt('hashed_admin_pw', gen_salt('bf', 10)), 'ADMIN', 'ACTIVE', TRUE),
(3001, 'tranvanquyen@student.tdtu.edu.vn', crypt('hashed_student_pw', gen_salt('bf', 10)), 'STUDENT', 'PENDING', TRUE),
(4001, 'guest@example.com', NULL, 'GUEST', 'INACTIVE', FALSE);


-- Nếu muốn lưu plain text (chỉ để test, KHÔNG khuyến nghị trong thực tế)
-- INSERT INTO users (email, password_hash, role, status, is_active)
-- VALUES ('admin@lms.com',crypt('admin123!', gen_salt('bf', 10)) , 'ADMIN', 'ACTIVE', TRUE);

-- INSERT INTO user_providers (user_id, provider_name, provider_user_id, access_token, refresh_token)
-- VALUES
-- (3, 'google', 'google_uid_123', 'access_token_abc', 'refresh_token_xyz'),
-- (3, 'facebook', 'fb_uid_456', 'fb_access_token', 'fb_refresh_token');


-- INSERT INTO password_resets (user_id, reset_token, expires_at)
-- VALUES
-- (2, 'reset_token_lecturer', NOW() + INTERVAL '1 day'),
-- (3, 'reset_token_student', NOW() + INTERVAL '1 day');


-- INSERT INTO audit_logs (user_id, target_user_id, action, details, ip_address)
-- VALUES
-- ('1', 3, 'CHANGE_ROLE', '{"reason": "Promoted student to lecturer"}', '192.168.1.10'),
-- ('1', 4, 'DISABLE_ACCOUNT', '{"reason": "Guest violated policy"}', '192.168.1.11');

