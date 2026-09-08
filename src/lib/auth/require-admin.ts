import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Verifies the current request is made by a logged-in user with the
 * `admin` or `super_admin` role, using the request-scoped (RLS-aware)
 * Supabase client — never trust the client, never skip this in a
 * Server Action that goes on to use the service-role key.
 *
 * Throws UnauthorizedError if the check fails. Callers should catch
 * this (or let it propagate — Next.js will surface a generic error
 * to the client) before touching `supabaseAdmin`.
 */
export async function requireAdmin(): Promise<{ id: string; role: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("Anda harus login terlebih dahulu.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new UnauthorizedError("Anda tidak memiliki akses admin.");
  }

  return { id: user.id, role: profile.role };
}

/** Same as requireAdmin(), but only allows super_admin (e.g. for role changes). */
export async function requireSuperAdmin(): Promise<{ id: string; role: string }> {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") {
    throw new UnauthorizedError("Hanya super admin yang dapat melakukan aksi ini.");
  }
  return admin;
}
