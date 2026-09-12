export type Role = "USER" | "ADMIN";
export type LinkStatus = "ACTIVE" | "DISABLED" | "EXPIRED";
export type ReportStatus = "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export interface UserSession {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  avatar?: string | null;
}

export interface LinkItem {
  id: string;
  userId?: string | null;
  shortCode: string;
  destinationUrl: string;
  customAlias?: string | null;
  title?: string | null;
  description?: string | null;
  status: LinkStatus;
  passwordProtected?: boolean;
  expiresAt?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: { id: string; name: string; color?: string | null }[];
}

export interface CreateLinkInput {
  destinationUrl: string;
  customAlias?: string;
  title?: string;
  description?: string;
  password?: string;
  expiresAt?: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  tagNames?: string[];
}

export interface UpdateLinkInput {
  destinationUrl?: string;
  customAlias?: string;
  title?: string;
  description?: string;
  status?: LinkStatus;
  password?: string | null;
  expiresAt?: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  tagNames?: string[];
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  totalLinks: number;
  avgClicksPerLink: number;
  growthRate: number;
  timeSeries: {
    date: string;
    clicks: number;
    uniqueVisitors: number;
  }[];
  devices: { name: string; value: number; percentage: number }[];
  browsers: { name: string; value: number; percentage: number }[];
  os: { name: string; value: number; percentage: number }[];
  countries: { country: string; countryCode: string; clicks: number; percentage: number }[];
  referrers: { source: string; clicks: number; percentage: number }[];
  topLinks: {
    id: string;
    shortCode: string;
    destinationUrl: string;
    title?: string | null;
    clicks: number;
    createdAt: string;
    status: LinkStatus;
  }[];
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  isRevoked: boolean;
}

export interface ReportItem {
  id: string;
  linkId: string;
  shortCode: string;
  destinationUrl: string;
  reason: string;
  description?: string | null;
  reporterEmail?: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  linksCount: number;
  clicksCount: number;
  createdAt: string;
  isSuspended?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
