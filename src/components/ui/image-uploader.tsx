"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export default function ImageUploader({
  onUpload,
  currentImage,
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 5,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.url) {
        onUpload(data.url);
        toast.success("Gambar berhasil diupload!");
      } else {
        toast.error(data.error || "Gagal upload gambar");
      }
    } catch {
      toast.error("Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview("");
    onUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label className="text-text">Gambar</Label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-surface"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <div className="animate-pulse">
                <Upload size={32} className="mx-auto text-primary animate-bounce" />
                <p className="text-sm text-text-muted mt-2">Mengupload...</p>
              </div>
            ) : (
              <>
                <ImageIcon size={32} className="mx-auto text-text-muted" />
                <p className="text-sm text-text-muted">
                  Drag & drop gambar atau klik untuk pilih
                </p>
                <p className="text-xs text-text-muted">
                  {accept.replace(/image\//g, "").toUpperCase()} • Maks {maxSize}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
