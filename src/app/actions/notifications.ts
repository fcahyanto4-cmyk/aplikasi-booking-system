"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "Unauthorized" };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Terjadi kesalahan" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "Unauthorized" };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, message: "Terjadi kesalahan" };
  }
}
