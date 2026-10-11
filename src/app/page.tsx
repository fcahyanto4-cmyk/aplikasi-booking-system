import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/landing/HeroSection";
import JadwalPreview from "@/components/landing/JadwalPreview";
import StatsSection from "@/components/landing/StatsSection";
import GaleriSection from "@/components/landing/GaleriSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import VenueSection from "@/components/landing/VenueSection";
import MemberDashboard from "@/components/home/MemberDashboard";
import type { ScheduleWithVenue, TestimonialWithProfile, BookingWithSchedule, EventWithVenue } from "@/types/database";

// Set revalidate time for this page
export const revalidate = 60; // 60 seconds

export default async function Home() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ──── LOGGED-IN USER: Member Dashboard ────
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch upcoming schedules
    const { data: schedules } = await supabase
      .from("schedules")
      .select("*, venues(*)")
      .gte("date", new Date().toISOString().split("T")[0])
      .eq("status", "open")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(6);

    // Fetch upcoming booking for the user
    const { data: upcomingBooking } = await supabase
      .from("bookings")
      .select("*, schedules(*, venues(*))")
      .eq("user_id", user.id)
      .eq("status", "booked")
      .eq("payment_status", "paid")
      .gte("schedules.date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Count active bookings
    const { count: activeBookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "booked")
      .eq("payment_status", "paid");

    // Count active event participations
    const { count: activeEventsCount } = await supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "registered")
      .eq("payment_status", "paid");

    // Fetch upcoming events
    const { data: events } = await supabase
      .from("events")
      .select("*, venues(*)")
      .gte("date", new Date().toISOString().split("T")[0])
      .in("status", ["upcoming", "ongoing"])
      .order("date", { ascending: true })
      .limit(3);

    return (
      <MemberDashboard
        profile={profile}
        email={user.email || ""}
        upcomingBooking={(upcomingBooking as unknown as BookingWithSchedule) || null}
        activeBookingsCount={activeBookingsCount || 0}
        activeEventsCount={activeEventsCount || 0}
        schedules={(schedules as unknown as ScheduleWithVenue[]) || []}
        events={(events as unknown as EventWithVenue[]) || []}
      />
    );
  }

  // ──── GUEST USER: Landing Page ────
  // Fetch Schedules with Venue
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, venues(*)")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(3);

  // Fetch Stats
  const [{ count: totalMembers }, { count: totalMabar }, { count: totalVenues }, { count: totalEvents }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("schedules").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
    ]);

  // Fetch Gallery
  const { data: galleryItems } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch Testimonials
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch Venues
  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen">
      <HeroSection />
      
      <StatsSection
        totalMembers={totalMembers || 0}
        totalMabar={totalMabar || 0}
        totalVenues={totalVenues || 0}
        totalEvents={totalEvents || 0}
      />

      <JadwalPreview schedules={(schedules as unknown as ScheduleWithVenue[]) || []} />
      
      <VenueSection venues={venues || []} />
      
      <GaleriSection galleryItems={galleryItems || []} />
      
      <TestimoniSection testimonials={(testimonials as unknown as TestimonialWithProfile[]) || []} />
    </main>
  );
}
