"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { signIn } from "next-auth/react";
import {
  GraduationCap,
  X,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Globe,
  Calendar,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoWithText } from "@/components/brand/logo";
import { motion } from "framer-motion";

const modalTranslations = {
  en: {
    loginTitle: "Welcome back to FLearn AI",
    registerTitle: "Create your FLearn AI account",
    loginDesc: "Sign in to access your dashboard, calendar, and AI study plans.",
    registerDesc: "Sign up to start planning smarter, instantly sync your syllabus and calendar.",
    continueGoogle: "Continue with Google",
    orEmail: "Or email with password",
    email: "Email Address",
    password: "Password",
    signingIn: "Signing In…",
    creatingAccount: "Creating Account…",
    signIn: "Sign In",
    createAccount: "Create Account",
    noAccount: "Don't have an account yet?",
    hasAccount: "Already have an account?",
    startTrial: "Register Account",
    signInAccount: "Sign in to your account",
    errorFillBoth: "Please fill in both email and password.",
    errorEmailInvalid: "Please enter a valid email address (must contain @).",
    errorPasswordShort: "Password must be at least 8 characters long.",
  },
  id: {
    loginTitle: "Selamat datang kembali di FLearn AI",
    registerTitle: "Buat akun FLearn AI Anda",
    loginDesc: "Masuk untuk mengakses dashboard, kalender, dan rencana belajar AI Anda.",
    registerDesc: "Daftar untuk mulai merencanakan lebih cerdas, sinkronisasi silabus dan kalender secara instan.",
    continueGoogle: "Lanjutkan dengan Google",
    orEmail: "Atau email dengan password",
    email: "Alamat Email",
    password: "Kata Sandi",
    signingIn: "Masuk…",
    creatingAccount: "Membuat Akun…",
    signIn: "Masuk",
    createAccount: "Daftar Akun",
    noAccount: "Belum punya akun?",
    hasAccount: "Sudah punya akun?",
    startTrial: "Daftar akun",
    signInAccount: "Masuk ke akun Anda",
    errorFillBoth: "Harap isi email dan password.",
    errorEmailInvalid: "Masukkan alamat email yang valid (harus mengandung @).",
    errorPasswordShort: "Password harus minimal 8 karakter.",
  }
};

export function LoginModal({ lang = "id" }: { lang?: string }) {
  const t = (modalTranslations as any)[lang] || modalTranslations.en;
  const { showLoginModal, setShowLoginModal, authView, setAuthView, login, loginWithProvider, lastEmailNotification, clearEmailNotification } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ providerName: string; email: string } | null>(null);
  const goToDashboard = () => {
    // Hard redirect — lebih reliable dari router.push karena modal bisa unmount
    // sebelum client-side navigation selesai.
    window.location.href = "/dashboard";
  };


  // Catch NextAuth default redirects and errors in the URL
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const urlError = url.searchParams.get("error");
      if (urlError) {
        setShowLoginModal(true);
        if (urlError === "CredentialsSignin") {
          setError("Email atau Password salah. Silakan periksa kembali.");
        } else {
          setError(`Gagal masuk: ${urlError}`);
        }
        // Remove error from URL so it doesn't show again on reload
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [setShowLoginModal]);

  if (!showLoginModal && !lastEmailNotification) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setActiveProvider("credentials");

    if (!email || !password) {
      setError(t.errorFillBoth);
      setIsLoading(false);
      setActiveProvider(null);
      return;
    }

    if (!email.includes("@")) {
      setError(t.errorEmailInvalid);
      setIsLoading(false);
      setActiveProvider(null);
      return;
    }

    if (password.length < 8) {
      setError(t.errorPasswordShort);
      setIsLoading(false);
      setActiveProvider(null);
      return;
    }

    try {
      if (authView === "register") {
        // Register flow
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const registerData = await registerRes.json();
        
        if (!registerRes.ok) {
          setError(registerData.error || "Gagal mendaftar. Silakan coba lagi.");
          setIsLoading(false);
          setActiveProvider(null);
          return;
        }

        // Auto login after successful registration
        const signInRes = await signIn("credentials", { email, password, redirect: false });
        if (signInRes?.error) {
          setError(signInRes.error);
        } else {
          setSuccessData({ providerName: "Email", email });
          setTimeout(() => {
            goToDashboard();
            setShowLoginModal(false);
            setSuccessData(null);
            setActiveProvider(null);
          }, 800);
        }
      } else {
        // Login flow
        const signInRes = await signIn("credentials", { email, password, redirect: false });
        if (signInRes?.error) {
          setError(signInRes.error);
        } else {
          setSuccessData({ providerName: "Email", email });
          setTimeout(() => {
            goToDashboard();
            setShowLoginModal(false);
            setSuccessData(null);
            setActiveProvider(null);
          }, 800);
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
      if (error) setActiveProvider(null);
    }
  };

  const handleProviderLogin = async (provider: "google" | "github" | "apple") => {
    setError("");
    setIsLoading(true);
    setActiveProvider(provider);

    if (provider === "google") {
      // Redirect langsung ke dashboard setelah Google login — no pop-up needed.
      await signIn("google", { callbackUrl: "/dashboard" });
      return;
    }

    // Fallback for mock providers (GitHub, Apple)
    const result = await loginWithProvider(provider);
    if (result.success) {
      setSuccessData({ providerName: result.providerName, email: result.email });
      setTimeout(() => {
        setShowLoginModal(false);
        setSuccessData(null);
        setActiveProvider(null);
      }, 2500);
    } else {
      setError(`Failed to connect with ${provider}. Please try again.`);
      setActiveProvider(null);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* 1. LOGIN MODAL OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
            className="w-full max-w-[400px] max-h-[calc(100dvh-5rem)] bg-card border border-border shadow-2xl rounded-2xl relative flex flex-col overflow-hidden"
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="text-center pt-6 pb-1 shrink-0">
              <div className="flex justify-center mb-2">
                <LogoWithText size={24} />
              </div>
              <CardTitle className="text-lg font-extrabold text-foreground tracking-tight leading-tight">
                {authView === "login" ? t.loginTitle : t.registerTitle}
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-1 max-w-[280px] mx-auto">
                {authView === "login" ? t.loginDesc : t.registerDesc}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 py-2 overflow-y-auto custom-scrollbar">
              {successData ? (
                <div className="flex flex-col items-center justify-center py-2 text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-success dark:text-green-400 shadow-inner animate-bounce">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Connected with {successData.providerName}!</p>
                    <p className="text-[10px] font-semibold text-primary dark:text-blue-400">{successData.email}</p>
                  </div>
                  {activeProvider === "google" && (
                    <div className="w-full rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-2 text-left space-y-1 shadow-sm mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary dark:text-blue-400">
                        <Calendar className="h-3.5 w-3.5" /> Auto-Synced
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Jadwal terhubung otomatis ke FLearn AI.
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground italic pt-2">
                    📧 Mengirim notifikasi login…
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {error && (
                    <div className="rounded-xl border border-danger/40 bg-red-50 dark:bg-red-950/30 p-2 text-[10px] text-danger dark:text-red-400 font-semibold text-center shadow-sm">
                      {error}
                    </div>
                  )}

                  {/* OAuth Buttons */}
                  <div>
                    <Button
                      type="button"
                      onClick={() => handleProviderLogin("google")}
                      disabled={isLoading}
                      className="w-full h-9 rounded-xl bg-card hover:bg-accent border border-border text-foreground text-xs font-bold shadow-sm hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-[0.96] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading && activeProvider === "google" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>{t.continueGoogle}</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t.orEmail}
                    </span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  {/* Credentials Form */}
                  <form onSubmit={handleCredentialsSubmit} className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground uppercase tracking-wider block text-center">
                        {t.email}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          placeholder="alex.chen@stanford.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-9 rounded-xl border border-border bg-accent/40 pl-9 pr-3 text-xs text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground uppercase tracking-wider block text-center">
                        {t.password}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-9 rounded-xl border border-border bg-accent/40 pl-9 pr-3 text-xs text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-9 mt-1 rounded-xl bg-gradient-to-r from-primary to-sky hover:from-primary-dark hover:to-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-[0.96] gap-2 cursor-pointer"
                    >
                      {isLoading && activeProvider === "credentials" ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {authView === "login" ? t.signingIn : t.creatingAccount}
                        </>
                      ) : (
                        <>
                          {authView === "login" ? t.signIn : t.createAccount} <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center px-6 py-3 bg-accent/30 border-t border-border text-[10px] text-muted-foreground shrink-0">
              <p>{authView === "login" ? t.noAccount : t.hasAccount}</p>
              <button
                onClick={() => setAuthView(authView === "login" ? "register" : "login")}
                className="text-primary dark:text-blue-400 font-bold hover:underline mt-0.5 cursor-pointer transition-all duration-300 hover:scale-[1.05] active:scale-95 inline-block"
              >
                {authView === "login" ? t.startTrial : t.signInAccount}
              </button>
            </CardFooter>
          </motion.div>
        </div>
      )}

      {/* 2. FLOATING EMAIL NOTIFICATION ALERT (SIMULATING GMAIL INBOX PUSH NOTIF) */}
      {lastEmailNotification && (
        <div className="fixed top-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300 pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-500 shadow-sm">
              <Bell className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground flex items-center gap-1">
                  📧 Gmail Inbox Alert
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">{lastEmailNotification.time}</span>
              </div>
              <p className="text-xs font-bold text-primary dark:text-blue-400 truncate max-w-[220px]">
                {lastEmailNotification.subject}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {lastEmailNotification.message}
              </p>
              <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 mt-2">
                <span>To: {lastEmailNotification.to}</span>
                <button
                  onClick={clearEmailNotification}
                  className="text-primary dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={clearEmailNotification}
              className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
