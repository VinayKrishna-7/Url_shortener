"use client";

import * as React from "react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ShieldAlert, AlertTriangle, CheckCircle2, Link2, Mail, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportAbusePage() {
  const { toast, error: toastError } = useToast();

  const [shortUrl, setShortUrl] = React.useState("");
  const [reason, setReason] = React.useState("phishing");
  const [description, setDescription] = React.useState("");
  const [reporterEmail, setReporterEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortUrl) {
      toastError("Validation Error", "Please provide the short link URL or code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortUrl, reason, description, reporterEmail }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit report");
      }

      setSubmitted(true);
      toast({
        type: "success",
        title: "Report Submitted",
        description: "Our Trust & Safety team has received your report for immediate review.",
      });
    } catch (err: unknown) {
      toastError("Submission Error", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-3 ring-8 ring-rose-500/5">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Report Abuse or Malicious Link
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                We take link safety seriously. If you encounter spam, phishing, malware, or illicit content on a ZapLink link, please submit a report below.
              </p>
            </div>

            <Card className="p-6 backdrop-blur-xl shadow-2xl border-border/80">
              {submitted ? (
                <div className="text-center py-8 space-y-4 animate-fade-in">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Thank you for keeping the web safe</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Our automated security scanners and moderation team have queued this report for investigation.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setShortUrl("");
                      setDescription("");
                    }}
                    className="mt-4 text-xs"
                  >
                    Submit Another Report
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Short Link URL or Code <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="https://zaplink.app/xyz or just xyz"
                      value={shortUrl}
                      onChange={(e) => setShortUrl(e.target.value)}
                      icon={<Link2 className="h-4 w-4" />}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Reason for Report <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
                    >
                      <option value="phishing">Phishing / Account Credential Theft</option>
                      <option value="malware">Malware / Virus Distribution</option>
                      <option value="spam">Spam / Unsolicited Marketing</option>
                      <option value="illegal">Illegal Content</option>
                      <option value="copyright">Copyright Infringement</option>
                      <option value="other">Other Violation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Details / Additional Context (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what you observed or any evidence..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="flex w-full rounded-xl border border-border/80 bg-background/60 p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Your Email (Optional, for investigation updates)
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      icon={<Mail className="h-4 w-4" />}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="glow"
                    isLoading={isLoading}
                    disabled={!shortUrl}
                    className="w-full h-11 text-xs font-bold gap-2 mt-2 shadow-md shadow-primary/25"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Submit Abuse Report</span>
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
