# Deployment & Security Checklist — Yuk Main Bola

This project went through a pre-launch security audit. Two critical
issues were found and fixed (see "What was fixed" below). Follow this
checklist in order before going live.

## 1. Set up Supabase

1. Create a Supabase project (or use an existing one).
2. In the SQL Editor, run these files **in this exact order**:
   1. `supabase/schema.sql`
   2. `supabase/schema-phase2.sql`
   3. `supabase/schema-phase3.sql`
   4. `supabase/schema-phase4.sql`
   5. `supabase/schema-phase5-storage.sql`
   6. `supabase/schema-phase7-realtime.sql`
   7. `supabase/schema-phase8-points.sql`
   8. `supabase/schema-phase9-group-booking.sql`
   9. **`supabase/schema-phase10-security-fixes.sql`** ← do not skip this one
3. (Optional) Run the seed files under `supabase/seed*.sql` if you want demo data.
4. Sign up for an account through the app itself with the email you want
   to be the first admin, then run `supabase/bootstrap-super-admin.sql`
   (edit the email first) to promote it to `super_admin`.
5. In Supabase Dashboard > Storage, confirm the `venues` and `gallery`
   buckets exist and are public-read (schema-phase5 creates these, but
   double-check bucket creation succeeded).

## 2. Set up Midtrans

1. Create a Midtrans account, get your **Sandbox** server/client keys first
   to test the full booking → payment → webhook flow end to end.
2. In the Midtrans Dashboard, set the **Payment Notification URL** to:
   `https://yourdomain.com/api/payment/notification`
3. Once you're happy in sandbox, switch to **Production** keys and set
   `MIDTRANS_IS_PRODUCTION=true`. The app automatically swaps the
   client-side Snap.js script URL based on this flag — you don't need
   to change any code.

## 3. Environment variables

Copy `.env.example` and fill in real values. Set the same variables in
your hosting provider (e.g. Vercel Project Settings > Environment
Variables). Pay attention to which keys are server-only:

| Variable | Exposed to browser? |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | **No — server only** |
| `MIDTRANS_SERVER_KEY` | **No — server only** |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Yes |
| `MIDTRANS_IS_PRODUCTION` | No (build-time flag) |

## 4. Deploy

This is a standard Next.js 16 (App Router) app — deploy to Vercel by
importing the repo and setting the env vars above, or run
`npm run build && npm run start` on your own infrastructure.

## 5. Post-deploy smoke test

- [ ] Register a new account, confirm a `profiles` row is created automatically.
- [ ] Book a schedule as a normal member, pay with a Midtrans sandbox test card,
      confirm the booking flips to `paid` and the slot count updates in real time.
- [ ] Cancel your own booking — should succeed.
- [ ] Confirm you (as a non-admin) get redirected away from `/admin`.
- [ ] Confirm your promoted super_admin account can log into `/admin` and
      manage venues/schedules/events/gallery/testimonials/users.
- [ ] From a second, non-admin account, confirm you can no longer see other
      users' `payment_status`/`snap_token` if you inspect network requests —
      the "who's playing" list on a schedule page should only show name,
      avatar, and guest count.

---

## What was fixed (pre-launch audit)

**Critical — Bookings were publicly readable, enabling booking hijack (IDOR).**
The `bookings` table's RLS policy allowed anyone (including logged-out
visitors) to read every booking's payment status, Midtrans token, and
order ID. Combined with the cancel-booking action trusting that read
scope, any logged-in user could cancel *any other user's* booking by
guessing its ID. Fixed by scoping `SELECT` to the booking's owner (plus
admins), and adding an explicit ownership check in the server action as
defense in depth. The public "who's playing" list now reads from a
dedicated `schedule_participants_public` view that only exposes safe
columns. The same defense-in-depth check was added to event
registrations.

**Critical — Admin actions had no server-side authorization.**
`addVenue`, `deleteVenue`, `addEvent`, `updateEventStatus`,
`addSchedule`, `updateScheduleStatus`, `addGalleryPhoto`,
`deleteGalleryPhoto`, `deleteTestimonial`, and especially
`updateUserRole` (which can grant `super_admin`) used the Supabase
service-role key — which bypasses all database security — with no
check that the caller was actually an admin. They only worked by
accident, because middleware happens to gate `/admin/*` pages. Fixed by
adding a `requireAdmin()` / `requireSuperAdmin()` guard
(`src/lib/auth/require-admin.ts`) that every one of these actions now
calls first.

**Removed a privilege-escalation debug endpoint.**
`/api/dev/make-admin` let the logged-in caller promote themselves to
`super_admin`, gated only by `NODE_ENV !== "development"` — too weak a
boundary for a route with this much power. Removed entirely; use
`supabase/bootstrap-super-admin.sql` instead.

**Fixed a real production bug in the payment flow.**
The Midtrans Snap.js `<script>` was hardcoded to the sandbox URL
regardless of `MIDTRANS_IS_PRODUCTION`, which would have caused
payment/environment mismatches in production. It now switches based on
the same flag that controls the server-side client.

**Hardening.**
- Added security response headers (HSTS, X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy) in `next.config.ts`.
- Restricted `next/image` remote patterns from any HTTPS host (`**`) to
  just Supabase Storage, since that's the only place images are
  actually uploaded from.
- Removed a leftover local debug script (`test-cancel.js`) with
  hardcoded test credentials.

## Known, lower-priority items not addressed
These are worth knowing about but did not block this pass:
- **Points redemption race condition**: concurrent bookings using
  points from the same account are not serialized against each other
  before the balance deduction, so in theory a user could race two
  requests to spend more points than they have. Low real-world risk
  given normal usage patterns, but worth a `SELECT ... FOR UPDATE`
  style guard if points become high-value.
- **No rate limiting** on server actions or the payment webhook route.
  Consider adding this at the edge (e.g. Vercel's built-in protections,
  or a middleware-based limiter) before high-traffic launch.
- **Mock email confirmation**: `sendBookingConfirmationEmail` only
  logs to the console; wire up a real provider (Resend/SendGrid) before
  launch if you want customers to actually receive confirmation emails.
