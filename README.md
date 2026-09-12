# ZapLink ⚡

<p align="center">
  <strong>Short links. Powerful insights.</strong>
  <br />
  <em>The modern, full-stack, enterprise-grade URL shortener & analytics platform.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.0-dc2626?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="License" />
</p>

---

## 🌟 Overview

**ZapLink** is a commercial-grade, full-stack URL shortener SaaS application designed for high-scale traffic, deep marketing intelligence, and developer automation. ZapLink combines sub-millisecond redirect routing, dynamic QR code creation, fine-grained click analytics (geography, devices, operating systems, browsers, referrers), revocable API keys, and enterprise security guardrails.

---

## ✨ Features

- ⚡ **High-Speed Redirection Engine**: Optimized routing with Redis caching, non-blocking asynchronous analytics capture, and sub-10ms redirect latency.
- 📊 **Real-Time Click Intelligence**:
  - Interactive clicks-over-time area charts (7-day, 30-day, 90-day, all-time filters)
  - Geographic visitor rankings with country flag identifiers
  - Hardware device distribution (Desktop, Mobile, Tablet)
  - Browser and Operating System breakdowns
  - Top referral channels (Google, X/Twitter, LinkedIn, GitHub, Direct)
- 🎨 **Dynamic QR Code Studio**:
  - Live customizable foreground & background colors
  - Multiple color preset themes
  - Scalable vector exports (SVG) and high-resolution raster exports (PNG up to 2048px)
  - Guaranteed high error-correction scannability (Level H)
- 🔒 **Enterprise Threat & SSRF Defense**:
  - Strict protocol enforcement (`http:` and `https:` only)
  - Rejection of dangerous protocols (`javascript:`, `data:`, `file:`, `vbscript:`, `blob:`)
  - Prevention of Server-Side Request Forgery (SSRF) by blocking localhost, loopback (`127.0.0.1`), link-local metadata endpoints (`169.254.169.254`), and private IPv4 ranges (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`)
  - Malicious and phishing domain keyword blocklist
  - Privacy-preserving IP anonymization with SHA-256 rotating salt
- 🔑 **Developer REST API & Key Management**:
  - Full CRUD endpoints (`/api/v1/links`)
  - SHA-256 hashed secret API keys (`lf_live_...`)
  - Revocation and last-used timestamp auditing
  - RFC 6585 rate limiting with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- 🛡️ **Access Control & Link Protection**:
  - Optional password-protected gates with sleek glassmorphic unlock screen
  - Time-based link expiration (1 hour, 24 hours, 7 days, 30 days, or custom date/time)
  - Instant link deactivation/activation toggle
  - Custom branded aliases (e.g., `zaplink.app/summer-sale`) with reserved keyword protection
  - UTM campaign tag builder
- 👥 **Role-Based Administration (`/admin`)**:
  - Live system health observability (PostgreSQL latency, Redis status, uptime)
  - Global user management and moderation
  - Global short link inspection and instant ban switch
  - Public abuse report intake (`/report`) and triage queue
- ⌨️ **Command Palette (`Cmd+K` / `Ctrl+K`)**:
  - Instant global keyboard navigation across links, analytics, QR studio, API keys, and settings.
- 🌓 **Design System**:
  - Cohesive dark/light mode with electric indigo (`#6366f1`) and cyan accents
  - Glassmorphic panels with Framer Motion spring microinteractions
  - Animated count-up numbers and confetti celebrations

---

## 🏗️ Architecture

```
                                  [ User Request ]
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │    Next.js 15 Edge    │
                             │   (App Router / SSR)  │
                             └───────────┬───────────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
                   ▼                     ▼                     ▼
          [ High-Speed Redirect ]  [ SaaS Dashboard ]    [ REST API v1 ]
             (/:shortCode)            (/dashboard)         (/api/v1/*)
                   │                     │                     │
                   ├─────────────────────┴─────────────────────┤
                   ▼                                           ▼
         ┌───────────────────┐                       ┌───────────────────┐
         │  Rate Limiting &  │                       │   Prisma ORM &    │
         │  Redis LRU Cache  │ ◄───────────────────► │  PostgreSQL DB    │
         └───────────────────┘                       └───────────────────┘
                   │
                   ▼ (Asynchronous)
         ┌───────────────────┐
         │  Analytics Engine │ ──► [ DailyLinkStats / ClickEvent Aggregations ]
         └───────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Forms & Validation** | React Hook Form, Zod, @hookform/resolvers |
| **Backend & API** | Next.js API Route Handlers, REST API (`/api/v1`), Zod |
| **Database & ORM** | PostgreSQL, Prisma ORM, Prisma Client |
| **Authentication** | NextAuth.js, bcryptjs (Salt rounds: 12), JWT Session strategy, RBAC |
| **Caching & Rate Limiting** | Redis (ioredis) with automatic In-Memory LRU fallback |
| **QR Code Engine** | node-qrcode (PNG data URLs + Scalable SVG strings) |
| **Testing** | Vitest, @testing-library/react, @testing-library/jest-dom |
| **DevOps & Containers** | Docker (multi-stage), Docker Compose, GitHub Actions CI/CD |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/VinayKrishna-7/Url_shortener.git
cd Url_shortener
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```
*(The defaults in `.env` are pre-configured for instant local development)*

### 4. Setup Database & Seed Demo Data
Start Postgres & Redis (or use your own PostgreSQL connection):
```bash
# Option A: With Docker
docker compose up postgres redis -d

# Option B: Push schema and seed
npx prisma db push
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Demo Accounts

When running `npm run db:seed`, the database is seeded with ready-to-test accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@zaplink.app` | `Password123!` | Full Admin Control Center (`/admin`), Moderation, System Health |
| **Demo User** | `demo@zaplink.app` | `Password123!` | Dashboard (`/dashboard`), Link Management, QR Studio, API Keys |

*(You can also use the 1-click demo login buttons on the `/sign-in` screen!)*

---

## 📡 REST API Reference

### Base URL: `https://zaplink.app/api/v1`

### Authentication
Include your API key as a Bearer token in the `Authorization` header:
```http
Authorization: Bearer lf_live_YOUR_API_KEY
```

### Endpoints

#### `POST /api/v1/links`
Create a new short link.

**Request Body:**
```json
{
  "destinationUrl": "https://example.com/products/summer-sale",
  "customAlias": "summer26",
  "title": "Summer Campaign",
  "password": "optional_passkey",
  "expiresAt": "2026-12-31T23:59:59Z",
  "utmSource": "twitter",
  "utmMedium": "social",
  "utmCampaign": "summer_drop",
  "tagNames": ["Marketing", "Summer"]
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "clxyz123...",
    "shortCode": "summer26",
    "shortUrl": "https://zaplink.app/summer26",
    "destinationUrl": "https://example.com/products/summer-sale?utm_source=twitter&utm_medium=social&utm_campaign=summer_drop",
    "status": "ACTIVE",
    "passwordProtected": false,
    "createdAt": "2026-08-31T10:00:00.000Z"
  }
}
```

#### `GET /api/v1/links`
List user links with pagination, search, and status filtering.

#### `GET /api/v1/links/:id`
Retrieve link metadata and configuration.

#### `PATCH /api/v1/links/:id`
Update destination URL, custom alias, expiration, title, or status.

#### `DELETE /api/v1/links/:id`
Delete a short link and invalidate cache.

#### `GET /api/v1/links/:id/analytics`
Retrieve granular analytics (time-series clicks, unique visitors, devices, browsers, operating systems, top countries, referrers).

---

## 🧪 Automated Testing

ZapLink includes a comprehensive test suite covering validation schemas, SSRF security defense, short code generation, and rate limiting:

```bash
# Run unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🐳 Docker & Production Deployment

### Docker Compose
Run the entire production stack (Next.js Application, PostgreSQL, Redis) with a single command:
```bash
docker compose up --build -d
```

### Production Build
```bash
npm run build
npm start
```

---

## 🛡️ Security Headers & Compliance

ZapLink is pre-configured with industry-standard HTTP security headers:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
