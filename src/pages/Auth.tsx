import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutTemplate, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";

type Step = "email" | "set-password" | "login";

interface CustomerInfo {
  found: boolean;
  is_claimed?: boolean;
  name?: string;
}

const Auth = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("check_customer_email", { p_email: email });
      if (error) throw error;

      const result = data as unknown as CustomerInfo;
      if (!result.found) {
        setError("Email belum terdaftar. Silakan hubungi admin untuk mendapatkan akses.");
      } else if (result.is_claimed) {
        setStep("login");
      } else {
        setCustomerName(result.name || "");
        setStep("set-password");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    }
    setLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, customerName);
    if (error) {
      setError(error.message);
    } else {
      const { error: loginError } = await signIn(email, password);
      if (loginError) setError(loginError.message);
      else navigate("/app");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    else navigate("/app");
    setLoading(false);
  };

  const goBack = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <LayoutTemplate className="text-primary" size={32} />
            <h1 className="font-display text-2xl font-extrabold">Kokurikuler Online</h1>
          </div>
          <p className="text-muted-foreground text-sm">Aplikasi Perencanaan Kokurikuler</p>
        </div>

        <div className="neo-card">
          {step === "email" ? (
            <>
              <h2 className="font-bold text-lg mb-1">Masuk</h2>
              <p className="text-sm text-muted-foreground mb-6">Masukkan email yang terdaftar untuk melanjutkan.</p>
              <form onSubmit={handleEmailCheck} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      required
                      className="neo-input pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-3 text-sm text-destructive font-medium flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="neo-btn-primary w-full">
                  {loading ? "Memeriksa..." : "Lanjutkan"}
                </button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Belum terdaftar? Hubungi admin untuk mendapatkan akses.
              </p>
            </>
          ) : step === "set-password" ? (
            <>
              <button onClick={goBack} className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft size={14} /> Kembali
              </button>
              <h2 className="font-bold text-lg mb-1">Buat Password</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Halo <strong>{customerName}</strong>, silakan buat password untuk akun Anda.
              </p>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={email} readOnly className="neo-input pl-10 bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      minLength={6}
                      className="neo-input pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      required
                      minLength={6}
                      className="neo-input pl-10 pr-10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-3 text-sm text-destructive font-medium">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="neo-btn-primary w-full">
                  {loading ? "Memproses..." : "Buat Akun"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={goBack} className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft size={14} /> Kembali
              </button>
              <h2 className="font-bold text-lg mb-1">Masuk</h2>
              <p className="text-sm text-muted-foreground mb-6">Masukkan password Anda untuk melanjutkan.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={email} readOnly className="neo-input pl-10 bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="neo-input pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-3 text-sm text-destructive font-medium">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="neo-btn-primary w-full">
                  {loading ? "Memproses..." : "Masuk"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
