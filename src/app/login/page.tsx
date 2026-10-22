"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, LogIn, Sparkles, User, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"member" | "admin" | null>(null);
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
          setError("Terjadi kesalahan. Silakan coba lagi.");
        }
        return;
      }

      toast.success("Login berhasil!");
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "member" | "admin") => {
    setError("");
    setDemoLoading(role);

    const demoEmail = role === "admin" ? "admin@yukmainbola.com" : "demo@yukmainbola.com";
    const demoPassword = role === "admin" ? "adminpassword123" : "demopassword123";
    const targetUrl = role === "admin" ? "/admin" : (redirectTo !== "/" ? redirectTo : "/");

    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        setError(`Gagal masuk akun demo: ${error.message}`);
        return;
      }

      toast.success(
        role === "admin"
          ? "Berhasil masuk sebagai Administrator!"
          : "Berhasil masuk sebagai Tamu Undangan!"
      );
      router.push(targetUrl);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat masuk akun demo.");
    } finally {
      setDemoLoading(null);
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
            <CardDescription className="text-text-muted">
              {redirectTo && redirectTo.startsWith("/event")
                ? "Masuk ke akunmu untuk mendaftar event & turnamen"
                : redirectTo && redirectTo.startsWith("/jadwal")
                ? "Masuk ke akunmu untuk bergabung ke jadwal mabar"
                : "Masuk ke akunmu untuk gabung mabar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Demo Access Box */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-surface to-accent/10 border border-primary/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent" />
                  Mode Demo / Reviewer
                </span>
                <span className="text-[10px] bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full border border-accent/30">
                  1-Click Akses
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Silakan pilih akun di bawah ini untuk mencoba seluruh fitur aplikasi tanpa perlu mendaftar:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickDemo("member")}
                  disabled={loading || demoLoading !== null}
                  className="w-full text-xs font-semibold border-primary/40 hover:bg-primary/20 text-text hover:text-primary transition-all py-2.5 h-auto flex items-center justify-center gap-1.5"
                >
                  {demoLoading === "member" ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : (
                    <User size={14} className="text-primary" />
                  )}
                  Masuk sebagai Tamu
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickDemo("admin")}
                  disabled={loading || demoLoading !== null}
                  className="w-full text-xs font-semibold border-accent/40 hover:bg-accent/20 text-text hover:text-accent transition-all py-2.5 h-auto flex items-center justify-center gap-1.5"
                >
                  {demoLoading === "admin" ? (
                    <Loader2 size={14} className="animate-spin text-accent" />
                  ) : (
                    <Shield size={14} className="text-accent" />
                  )}
                  Masuk sebagai Admin
                </Button>
              </div>
            </div>

            {redirectTo && (redirectTo.startsWith("/jadwal") || redirectTo.startsWith("/event")) && (
              <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs flex items-center gap-2">
                <LogIn size={16} className="shrink-0" />
                <span>
                  {redirectTo.startsWith("/event")
                    ? "Silakan login terlebih dahulu untuk mendaftar event."
                    : "Silakan login terlebih dahulu untuk bergabung ke jadwal mabar."}
                </span>
              </div>
            )}

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-text-muted">Atau masuk manual</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm" role="alert" aria-live="polite">
                  {error}
                </div>
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
                  disabled={loading || demoLoading !== null}
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "email-error" : undefined}
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
                    disabled={loading || demoLoading !== null}
                    required
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || demoLoading !== null}
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
