"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone: phone || null },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Email sudah terdaftar");
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess("Pendaftaran berhasil! Silakan login.");
      toast.success("Akun berhasil dibuat!");
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
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
            <CardTitle className="text-2xl font-bold text-text">Daftar</CardTitle>
            <CardDescription className="text-text-muted">Buat akun dan mulai gabung mabar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">{success}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-text">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Nama lengkap kamu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background border-border text-text placeholder:text-text-muted/50 focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>

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
                    placeholder="Minimal 8 karakter"
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

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-text">
                  No. Telepon <span className="text-text-muted">(opsional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background border-border text-text placeholder:text-text-muted/50 focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg transition-all duration-300"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" />Daftar</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-muted text-sm">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
