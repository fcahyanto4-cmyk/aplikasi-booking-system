-- ============================================
-- Yuk Main Bola — Phase 10: Security Hardening
-- Run this in Supabase SQL Editor AFTER all previous phases
-- ============================================
-- Fixes two issues found in a pre-launch security audit:
--
-- 1. `bookings_select_public` allowed ANY visitor (even anonymous,
--    unauthenticated ones) to read EVERY row of the `bookings` table,
--    including other users' payment_status, Midtrans snap_token,
--    order_id and guest_names. Combined with the app-level
--    cancelBooking() action (which trusted RLS to have already
--    scoped the row to the caller), this also allowed any logged-in
--    user to cancel ANY other user's booking by guessing/enumerating
--    a booking id (IDOR).
--
-- 2. The public "who's playing" list on /jadwal/[id] only needs
--    user_id, quantity, guest_names and the player's name/avatar —
--    not payment/financial fields. We expose that via a safe view
--    instead of relaxing the table's RLS.
-- ============================================

-- ------------------------------------------------
-- Step 1: Replace the overly-permissive SELECT policy
-- ------------------------------------------------
DROP POLICY IF EXISTS "bookings_select_public" ON public.bookings;

CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Note: "bookings_admin_all" (FOR ALL ... USING (get_user_role() IN
-- ('admin','super_admin'))) already exists from phase 2 and continues
-- to give admins full access, so the admin dashboard keeps working.

-- ------------------------------------------------
-- Step 2: Safe public view for "who's playing" on the schedule page
-- (exposes only non-sensitive columns, for active/booked rows only)
-- ------------------------------------------------
CREATE OR REPLACE VIEW public.schedule_participants_public AS
SELECT
  b.schedule_id,
  b.user_id,
  b.quantity,
  b.guest_names,
  p.full_name,
  p.avatar_url
FROM public.bookings b
JOIN public.profiles p ON p.id = b.user_id
WHERE b.status = 'booked';

-- This view is owned by the migration-running role (postgres), so by
-- default (security_invoker = false) it bypasses the callers' RLS —
-- that's intentional here since it's already filtered to only the
-- safe columns we want public. Grant read access explicitly:
GRANT SELECT ON public.schedule_participants_public TO anon, authenticated;

-- ------------------------------------------------
-- Step 3 (defense in depth): tighten event_participants the same way
-- it already was (no change needed — event_participants_select_own
-- was already scoped correctly), but double-check RLS is enabled.
-- ------------------------------------------------
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Note: profiles_update_own (phase 1, schema.sql) already prevents a
-- user from changing their own `role` column, and only
-- profiles_update_super allows role changes. That was already correct
-- at the DB level — the gap was purely in the application layer
-- (admin server actions had no auth check and used the service-role
-- key, which bypasses RLS entirely). See the accompanying code fix
-- to src/app/actions/admin-*.ts (requireAdmin() guard added).
