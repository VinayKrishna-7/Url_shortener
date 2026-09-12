"use client";

import * as React from "react";
import Link from "next/link";
import { Zap, Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast({
      type: "success",
      title: "Reset link dispatched",
      description: "If an account exists with that email, instructions have been sent.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-lg shadow-primary/30">
              <Zap className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-foreground">
              Link<span className="text-primary">Forge</span>
            </span>
          </Link>
        </div>

        <Card className="p-6 backdrop-blur-xl shadow-2xl border-border/80 glow-purple">
          <CardHeader className="p-0 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
            <CardDescription className="text-xs mt-1">
              Enter your email and we&apos;ll send you instructions to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">Check your email</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We sent a recovery link to <span className="font-mono text-foreground font-medium">{email}</span>.
                </p>
                <Link href="/sign-in" className="inline-block mt-4">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Account Email
                  </label>
                  <Input
                    type="email"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="h-4 w-4" />}
                    required
                    autoFocus
                  />
                </div>

                <Button type="submit" variant="glow" className="w-full h-11 rounded-xl text-xs font-bold gap-2">
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Reset Instructions</span>
                </Button>

                <div className="text-center pt-2">
                  <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
