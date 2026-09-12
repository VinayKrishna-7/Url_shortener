import React from "react";
import { Badge } from "../ui/badge";
import { Lock, Clock, CheckCircle2, Ban } from "lucide-react";
import { LinkStatus } from "@/types";

interface StatusBadgeProps {
  status: LinkStatus;
  passwordProtected?: boolean;
  expiresAt?: string | null;
}

export function StatusBadge({ status, passwordProtected, expiresAt }: StatusBadgeProps) {
  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : status === "EXPIRED";

  if (isExpired) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Clock className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  if (status === "DISABLED") {
    return (
      <Badge variant="muted" className="gap-1">
        <Ban className="h-3 w-3" />
        Disabled
      </Badge>
    );
  }

  if (passwordProtected) {
    return (
      <Badge variant="warning" className="gap-1">
        <Lock className="h-3 w-3" />
        Password Protected
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 className="h-3 w-3" />
      Active
    </Badge>
  );
}
