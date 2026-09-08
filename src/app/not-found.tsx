import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <AlertTriangle size={40} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-text mb-4">404</h1>
        <h2 className="text-xl font-semibold text-text mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-text-muted mb-8">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg transition-all duration-300"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
