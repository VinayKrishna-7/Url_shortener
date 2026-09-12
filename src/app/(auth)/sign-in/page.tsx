"use client";

import * as React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, UserCheck } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const initialEmail = searchParams.get("email") || "";

  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = React.useState(initialEmail);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // If already authenticated with a session
  if (status === "authenticated" && session?.user) {
    return (
      <Card className="p-6 backdrop-blur-xl shadow-2xl border-border glow-purple animate-fade-in">
        <CardHeader className="p-0 pb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Already Logged In</CardTitle>
          <CardDescription className="text-xs mt-1">
            You are currently signed in as <strong className="text-foreground font-semibold">{session.user.name || session.user.email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-3">
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-center">
            <p className="text-muted-foreground">Active Session Account:</p>
            <p className="font-mono font-bold text-sm text-foreground mt-0.5">{session.user.email}</p>
          </div>

          <Link href="/dashboard" className="block w-full">
            <Button variant="glow" className="w-full h-11 text-xs font-bold gap-2 shadow-md shadow-primary/25">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="w-full h-10 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Sign Out & Switch Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setAuthError("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password,
      });

      if (!res || res.error) {
        let msg = res?.error || "Invalid email or password. Please verify your credentials.";
        if (msg === "CredentialsSignin") {
          msg = "Invalid email or password. Please verify your credentials or create a new account.";
        }
        setAuthError(msg);
        return;
      }

      toast({
        type: "success",
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
      });

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setAuthError((err as Error).message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-xl shadow-2xl border-border glow-purple">
      <CardHeader className="p-0 pb-6 text-center">
        <CardTitle className="text-2xl font-bold">Sign In to ZapLink</CardTitle>
        <CardDescription className="text-xs mt-1">
          Enter your registered email and password to access your dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* Inline Error Alert Banner */}
        {authError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">
              <p>{authError}</p>
              {authError.toLowerCase().includes("no account found") && (
                <Link href="/sign-up" className="mt-1.5 inline-block font-bold underline hover:opacity-80">
                  Click here to Create an Account &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError) setAuthError(null);
              }}
              icon={<Mail className="h-4 w-4" />}
              required
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError(null);
              }}
              icon={<Lock className="h-4 w-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
            />
          </div>

          <Button
            type="submit"
            variant="glow"
            isLoading={isLoading}
            className="w-full h-11 rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/25 mt-2"
          >
            <span>Unlock & Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="p-0 pt-6 mt-6 border-t border-border/60 justify-center">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-foreground">
              Zap<span className="text-primary">Link</span>
            </span>
          </Link>
        </div>

        <React.Suspense fallback={<div className="h-80 w-full rounded-2xl bg-card animate-pulse" />}>
          <SignInForm />
        </React.Suspense>
      </motion.div>
    </div>
  );
}
