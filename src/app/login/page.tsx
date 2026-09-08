"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email atau password salah");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email belum dikonfirmasi. Hubungi admin untuk konfirmasi manual.");
        } else {
          setError(error.message);
        }
        return;
      }

      toast.success("Login berhasil!");
      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="bg-surface border-border">
          <CardHeader className="text-center space-y-2">
            <Link href="/" className="inline-block mx-auto mb-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Yuk Main Bola
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold text-text">Masuk</CardTitle>
            <CardDescription className="text-text-muted">Masuk ke akunmu untuk gabung mabar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-text">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-text placeholder:text-text-muted/50 focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-text">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border text-text placeholder:text-text-muted/50 focus-visible:ring-primary pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg transition-all duration-300"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
                ) : (
                  <><LogIn className="mr-2 h-4 w-4" />Masuk</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-text-muted text-sm">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Daftar sekarang
                </Link>
              </p>
              <p className="text-text-muted text-sm">
                <Link href="/forgot-password" className="text-primary/70 hover:text-primary transition-colors text-xs">
                  Lupa password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
