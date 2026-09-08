"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function addGalleryPhoto(formData: FormData) {
  try {
    await requireAdmin();

    const caption = formData.get("caption") as string;
    const image = formData.get("image") as File;

    if (!image || image.size === 0) {
      return { success: false, message: "Foto wajib diunggah." };
    }

    // Create a unique filename
    const fileExt = image.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("gallery")
      .upload(filePath, image);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, message: "Gagal mengunggah foto ke storage." };
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("gallery")
      .getPublicUrl(filePath);
      
    const image_url = publicUrlData.publicUrl;

    const { error: insertError } = await supabaseAdmin
      .from("gallery")
      .insert({
        caption: caption || null,
        image_url
      });

    if (insertError) {
      console.error("Insert gallery error:", insertError);
      return { success: false, message: "Gagal menyimpan data foto." };
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/");
    return { success: true, message: "Foto berhasil ditambahkan ke galeri." };

  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return { success: false, message: error.message };
    }
    console.error("Add gallery error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function deleteGalleryPhoto(id: string) {
  try {
    await requireAdmin();

    const { error } = await supabaseAdmin
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete gallery error:", error);
      return { success: false, message: "Gagal menghapus foto." };
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/");
    return { success: true, message: "Foto berhasil dihapus dari galeri." };
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return { success: false, message: error.message };
    }
    console.error("Delete gallery exception:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
