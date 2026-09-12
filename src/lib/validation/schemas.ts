import { z } from "zod";

export const createLinkSchema = z.object({
  destinationUrl: z
    .string({ required_error: "Destination URL is required" })
    .min(1, "Destination URL is required")
    .max(2048, "URL exceeds maximum length of 2048 characters"),
  customAlias: z
    .string()
    .min(3, "Custom alias must be at least 3 characters")
    .max(50, "Custom alias cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Custom alias can only contain letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
  title: z.string().max(100, "Title cannot exceed 100 characters").optional().or(z.literal("")),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  password: z.string().max(100, "Password cannot exceed 100 characters").optional().or(z.literal("")),
  expiresAt: z.string().datetime({ message: "Invalid ISO date string" }).nullable().optional(),
  utmSource: z.string().max(100).optional().or(z.literal("")),
  utmMedium: z.string().max(100).optional().or(z.literal("")),
  utmCampaign: z.string().max(100).optional().or(z.literal("")),
  utmTerm: z.string().max(100).optional().or(z.literal("")),
  utmContent: z.string().max(100).optional().or(z.literal("")),
  tagNames: z.array(z.string().max(30)).optional(),
});

export const updateLinkSchema = z.object({
  destinationUrl: z.string().min(1).max(2048).optional(),
  customAlias: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional()
    .or(z.literal("")),
  title: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "DISABLED", "EXPIRED"]).optional(),
  password: z.string().max(100).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  utmSource: z.string().max(100).optional().or(z.literal("")),
  utmMedium: z.string().max(100).optional().or(z.literal("")),
  utmCampaign: z.string().max(100).optional().or(z.literal("")),
  utmTerm: z.string().max(100).optional().or(z.literal("")),
  utmContent: z.string().max(100).optional().or(z.literal("")),
  tagNames: z.array(z.string().max(30)).optional(),
});

export const unlockLinkSchema = z.object({
  shortCode: z.string().min(1),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(60),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createApiKeySchema = z.object({
  name: z.string().min(2, "API key name must be at least 2 characters").max(50),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const createReportSchema = z.object({
  shortCode: z.string().optional().or(z.literal("")),
  shortUrl: z.string().optional().or(z.literal("")),
  reason: z.string().min(3, "Please provide a reason with at least 3 characters").max(500),
  description: z.string().max(1000).optional().or(z.literal("")),
  reporterEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});
