"use client";

import * as React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Zap, Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [signupError, setSignupError] = React.useState<string | null>(null);
  const [isEmailExisting, setIsEmailExisting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setIsEmailExisting(false);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setSignupError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setSignupError("The passwords you entered do not match. Please verify.");
      return;
    }

    if (password.length < 8) {
      setSignupError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409 || json.error?.code === "USER_EXISTS" || json.error?.message?.toLowerCase().includes("already registered") || json.error?.message?.toLowerCase().includes("already exist")) {
          setIsEmailExisting(true);
          const msg = "This email is already registered. Please sign in to your account instead.";
          setSignupError(msg);
          toastError("Email Already Registered", "An account with this email already exists. Please sign in.");
          return;
        }

        const msg = json.error?.message || "Registration failed. Please try again.";
        setSignupError(msg);
        toastError("Registration Failed", msg);
        return;
      }

      toast({
        type: "success",
        title: "Account Created!",
        description: "Signing you into your new ZapLink workspace...",
      });

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/sign-in");
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || "An unexpected network error occurred. Please try again.";
      setSignupError(msg);
      toastError("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

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

        <Card className="p-6 backdrop-blur-xl shadow-2xl border-border glow-purple">
          <CardHeader className="p-0 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">Create your ZapLink Account</CardTitle>
            <CardDescription className="text-xs mt-1">
              Start shortening links and tracking real-time insights
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {/* Prominent Email Already Exists Alert */}
            {isEmailExisting ? (
              <div className="mb-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-foreground animate-fade-in shadow-lg">
                <div className="flex items-center gap-2 font-bold text-amber-500 mb-1.5 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Email Already Registered</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  An account with <strong className="text-foreground">{email}</strong> already exists.
                </p>
                <Link
                  href={`/sign-in?email=${encodeURIComponent(email)}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>👉 Sign In to Your Account Instead</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : signupError ? (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium">{signupError}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Alex Vance"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  icon={<User className="h-4 w-4" />}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (signupError) setSignupError(null);
                    if (isEmailExisting) setIsEmailExisting(false);
                  }}
                  icon={<Mail className="h-4 w-4" />}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Password
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (signupError) setSignupError(null);
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

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Confirm Password
                </label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  icon={<Lock className="h-4 w-4" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              {/* Password Requirements */}
              <div className="space-y-1 rounded-xl bg-muted/40 p-2.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Check
                    className={`h-3 w-3 ${
                      hasMinLength ? "text-emerald-400 font-bold" : "text-muted-foreground"
                    }`}
                  />
                  <span className={hasMinLength ? "text-foreground" : "text-muted-foreground"}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check
                    className={`h-3 w-3 ${
                      hasUpperCase ? "text-emerald-400 font-bold" : "text-muted-foreground"
                    }`}
                  />
                  <span className={hasUpperCase ? "text-foreground" : "text-muted-foreground"}>
                    Contains uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check
                    className={`h-3 w-3 ${
                      hasNumber ? "text-emerald-400 font-bold" : "text-muted-foreground"
                    }`}
                  />
                  <span className={hasNumber ? "text-foreground" : "text-muted-foreground"}>
                    Contains a number
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="glow"
                isLoading={isLoading}
                className="w-full h-11 rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/25 mt-2"
              >
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="p-0 pt-5 mt-5 border-t border-border/60 justify-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
