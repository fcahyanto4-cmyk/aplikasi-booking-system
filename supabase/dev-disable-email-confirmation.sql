-- ============================================
-- Yuk Main Bola — Phase 12: Email Verification Disable Helper
-- ============================================
-- UNTUK DEVELOPMENT ONLY: Disable email confirmation
-- agar user bisa langsung login tanpa verifikasi email.
--
-- Cara pakai:
-- 1. Buka Supabase Dashboard → Authentication → Providers → Email
-- 2. Uncheck "Enable email confirmations"
-- 3. Save
--
-- ATAU jalankan ini di SQL Editor:
-- UPDATE auth.users SET confirmed_at = NOW() WHERE confirmed_at IS NULL;
-- ============================================

-- Helper: Confirm all pending users (development only)
UPDATE auth.users SET confirmed_at = NOW() WHERE confirmed_at IS NULL;

-- Verify: Check confirmed users
-- SELECT id, email, confirmed_at FROM auth.users ORDER BY created_at DESC;
