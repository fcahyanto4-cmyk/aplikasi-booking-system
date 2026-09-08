"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function deleteTestimonial(id: string) {
  try {
    await requireAdmin();

    const { error } = await supabaseAdmin
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete testimonial error:", error);
      return { success: false, message: "Gagal menghapus testimoni." };
    }

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, message: "Testimoni berhasil dihapus." };
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return { success: false, message: error.message };
    }
    console.error("Delete testimonial exception:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
