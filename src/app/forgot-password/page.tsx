"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess("Email reset password telah dikirim. Cek inbox kamu.");
      toast.success("Email reset terkirim!");
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
            <CardTitle className="text-2xl font-bold text-text">Reset Password</CardTitle>
            <CardDescription className="text-text-muted">Masukkan email kamu untuk menerima link reset password</CardDescription>
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg transition-all duration-300"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" />Kirim Link Reset</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-muted text-sm">
                Ingat password?{" "}
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
