-- ============================================
-- Yuk Main Bola — Phase 11: Auto-Expire Bookings
-- Run this in Supabase SQL Editor
-- ============================================
-- Booking dengan payment_status = 'pending' lebih dari 15 menit
-- akan otomatis dibatalkan dan slot dibebaskan.
-- ============================================

-- Function untuk auto-expire booking
CREATE OR REPLACE FUNCTION public.auto_expire_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, schedule_id
    FROM public.bookings
    WHERE payment_status = 'pending'
      AND created_at < NOW() - INTERVAL '15 minutes'
  LOOP
    -- Update booking status to cancelled
    UPDATE public.bookings
    SET status = 'cancelled', payment_status = 'expired'
    WHERE id = r.id;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Comment: Untuk production, setup pg_cron untuk jalankan function ini setiap 5 menit:
-- SELECT cron.schedule('auto-expire-bookings', '*/5 * * * *', 'SELECT public.auto_expire_bookings()');

-- Atau gunakan endpoint /api/cron/auto-expire yang bisa dipanggil external cron service.
