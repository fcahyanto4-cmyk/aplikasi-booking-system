"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-admin";

export async function updateUserRole(userId: string, newRole: "super_admin" | "admin" | "member" | "guest") {
  try {
    // Only a super_admin may grant/revoke admin & super_admin roles.
    const actor = await requireSuperAdmin();

    // Extra guard: don't allow a super_admin to accidentally demote themselves
    // out of the only super_admin account via this button.
    if (actor.id === userId && newRole !== "super_admin") {
      return { success: false, message: "Anda tidak dapat mengubah role akun Anda sendiri di sini." };
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Update role error:", error);
      return { success: false, message: "Gagal memperbarui role pengguna." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Role berhasil diperbarui." };
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return { success: false, message: err.message };
    }
    console.error("Unexpected error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
