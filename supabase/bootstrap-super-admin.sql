-- ============================================
-- Yuk Main Bola — Bootstrap the first Super Admin
-- ============================================
-- The old `/api/dev/make-admin` endpoint has been removed: an HTTP
-- route that can promote the calling user to super_admin is a
-- standing privilege-escalation risk (it only checked
-- NODE_ENV !== "development", which is not a safe boundary — env
-- vars get misconfigured, and the check happens too late anyway if
-- someone can influence the deployment's NODE_ENV).
--
-- Instead, promote your first admin directly in the database, which
-- requires access to the Supabase SQL Editor / service role — a much
-- stronger boundary than an app-level HTTP check.
--
-- Steps:
-- 1. Sign up normally through the app with the email you want to be
--    the super admin.
-- 2. Run this in the Supabase SQL Editor (Dashboard > SQL Editor),
--    replacing the email below.
-- 3. Refresh /admin in the app.
-- ============================================

UPDATE public.profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');

-- Verify:
-- SELECT id, email, role FROM public.profiles p
--   JOIN auth.users u ON u.id = p.id
--   WHERE p.role IN ('admin', 'super_admin');
