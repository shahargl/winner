# Project Setup Guide

> **For AI Agents**: This document provides step-by-step instructions to quickly scaffold a new project using the same tech stack as this codebase (Next.js 16, Vercel, Supabase, Stripe, PostHog, NextAuth, Tailwind CSS v4).

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Prerequisites](#prerequisites)
3. [Project Initialization](#project-initialization)
4. [Configuration Files](#configuration-files)
5. [Environment Variables](#environment-variables)
6. [Supabase Setup](#supabase-setup)
7. [Authentication (NextAuth)](#authentication-nextauth)
8. [PostHog Analytics](#posthog-analytics)
9. [Stripe Payments](#stripe-payments)
10. [Styling (Tailwind CSS v4)](#styling-tailwind-css-v4)
11. [Vercel Deployment](#vercel-deployment)
12. [Directory Structure](#directory-structure)
13. [Key Patterns](#key-patterns)

---

## Stack Overview

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS |
| Supabase | Latest | PostgreSQL database + auth |
| NextAuth | 4.x | Authentication |
| Stripe | Latest | Payment processing |
| PostHog | Latest | Product analytics |
| Vercel | - | Hosting & deployment |

---

## Prerequisites

Before starting, ensure you have accounts set up for:

- **Vercel** - https://vercel.com
- **Supabase** - https://supabase.com
- **PostHog** - https://posthog.com
- **Stripe** - https://stripe.com
- Your OAuth provider (Strava, Google, GitHub, etc.)

---

## Project Initialization

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest my-project --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd my-project
```

### Step 2: Install Core Dependencies

```bash
npm install @supabase/supabase-js next-auth posthog-js stripe zod
```

### Step 3: Install Dev Dependencies

```bash
npm install -D @tailwindcss/postcss @types/node @types/react @types/react-dom typescript eslint eslint-config-next tailwindcss
```

### Step 4: Optional AI/Chat Dependencies

If building an AI-powered app:

```bash
npm install ai @ai-sdk/openai @ai-sdk/google
# Or for CopilotKit:
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
```

---

## Configuration Files

### `package.json`

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.87.1",
    "next": "16.0.8",
    "next-auth": "^4.24.13",
    "posthog-js": "^1.308.0",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "stripe": "^20.0.0",
    "zod": "^4.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.8",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add domains for user avatars/images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Externalize problematic packages for Turbopack
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
};

export default nextConfig;
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### `eslint.config.mjs`

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

### `vercel.json` (Optional - for cron jobs)

```json
{
  "crons": [
    {
      "path": "/api/sync/cron",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Environment Variables

Create `.env.local` for local development:

```bash
# ===================
# SUPABASE
# ===================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# ===================
# NEXTAUTH
# ===================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# ===================
# OAUTH PROVIDER (example: Strava)
# ===================
STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-client-secret

# ===================
# POSTHOG
# ===================
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# ===================
# STRIPE
# ===================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...

# ===================
# OPTIONAL: AI
# ===================
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Supabase Setup

### Step 1: Create Project

1. Go to https://supabase.com/dashboard
2. Create a new project
3. Copy the Project URL and anon key

### Step 2: Database Schema

Create a file `supabase/schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT,
  avatar TEXT,
  -- Add OAuth-specific fields as needed
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (for Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end TIMESTAMP WITH TIME ZONE,
  tier_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(user_id, status);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for server-side access)
CREATE POLICY "Service can manage users" ON users FOR ALL USING (true);
CREATE POLICY "Service can manage subscriptions" ON subscriptions FOR ALL USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Database Client (`lib/db.ts`)

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
};

// Convenience wrapper
export const supabase = {
  from: (table: string) => getSupabase().from(table),
  rpc: (fn: string, params?: Record<string, unknown>) => getSupabase().rpc(fn, params),
};

// Example database operations
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

export async function upsertUser(user: { email: string; name?: string; avatar?: string }) {
  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'email' })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }
  return data;
}
```

---

## Authentication (NextAuth)

### Step 1: Auth Configuration (`lib/auth.ts`)

```typescript
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// Or use other providers

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add more providers as needed
  ],
  callbacks: {
    async signIn({ user }) {
      // Store user in database
      // await upsertUser({ email: user.email!, name: user.name, avatar: user.image });
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
```

### Step 2: API Route (`app/api/auth/[...nextauth]/route.ts`)

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## PostHog Analytics

### Step 1: PostHog Provider (`components/posthog-provider.tsx`)

```typescript
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (apiKey && host) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll capture manually
        capture_pageleave: true,
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### Step 2: Page View Tracking (`components/posthog-pageview.tsx`)

```typescript
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

### Step 3: User Identification (`components/posthog-user-identify.tsx`)

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';

export function PostHogUserIdentify() {
  const { data: session, status } = useSession();
  const posthog = usePostHog();
  const lastIdentifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user && posthog) {
      if (lastIdentifiedUserId.current !== session.user.id) {
        posthog.identify(session.user.id, {
          name: session.user.name,
          email: session.user.email,
        });
        lastIdentifiedUserId.current = session.user.id;
      }
    }

    if (status === 'unauthenticated' && posthog) {
      posthog.reset();
      lastIdentifiedUserId.current = null;
    }
  }, [session, status, posthog]);

  return null;
}
```

---

## Stripe Payments

### Step 1: Stripe Client (`lib/stripe.ts`)

```typescript
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY must be provided');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return _stripe;
};

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  returnUrl: string,
  priceId: string
): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });

  return session.url!;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
```

### Step 2: Webhook Handler (`app/api/stripe/webhook/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        // Handle subscription creation
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription update
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellation
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## Styling (Tailwind CSS v4)

### `app/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-background: #18181b;
  --color-foreground: #fafafa;
  --color-card: #27272a;
  --color-card-hover: #3f3f46;
  --color-border: #3f3f46;
  --color-accent: #fb7185;
  --color-accent-light: #fda4af;
  --color-muted: #a1a1aa;
  --color-success: #4ade80;
  --color-error: #f43f5e;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root,
html,
body {
  --background: #18181b;
  --foreground: #fafafa;
  --card: #27272a;
  --card-hover: #3f3f46;
  --border: #3f3f46;
  --accent: #fb7185;
  --accent-light: #fda4af;
  --accent-gradient: linear-gradient(135deg, #e11d48 0%, #fb7185 100%);
  --muted: #a1a1aa;
  --success: #4ade80;
  --error: #f43f5e;
}

* {
  box-sizing: border-box;
}

html {
  height: 100dvh;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
  min-height: 100dvh;
  overscroll-behavior: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--card);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Gradient text */
.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Button styles */
.btn-primary {
  background: var(--accent-gradient);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
}

.btn-secondary {
  background: var(--card);
  color: var(--foreground);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--card-hover);
  border-color: var(--muted);
}

/* Card styles */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.card:hover {
  border-color: var(--muted);
}

/* Input styles */
.input {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--foreground);
  width: 100%;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(232, 115, 90, 0.2);
}

.input::placeholder {
  color: var(--muted);
}
```

---

## Vercel Deployment

### Step 1: Connect to Vercel

```bash
npm i -g vercel
vercel login
vercel
```

### Step 2: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add all variables from `.env.local`.

### Step 3: Configure Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret to Vercel env vars

---

## Directory Structure

```
my-project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── stripe/
│   │       ├── checkout/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── route.ts
│   ├── login/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── posthog-pageview.tsx
│   ├── posthog-provider.tsx
│   ├── posthog-user-identify.tsx
│   └── providers.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── stripe.ts
├── supabase/
│   └── schema.sql
├── .env.local
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── vercel.json
```

---

## Key Patterns

### 1. Providers Wrapper (`components/providers.tsx`)

Wrap all providers in a single component for clean layout:

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { PostHogProvider } from './posthog-provider';
import { PostHogUserIdentify } from './posthog-user-identify';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <SessionProvider>
        <PostHogUserIdentify />
        {children}
      </SessionProvider>
    </PostHogProvider>
  );
}
```

### 2. Root Layout (`app/layout.tsx`)

```typescript
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { PostHogPageView } from '@/components/posthog-pageview';
import { Suspense } from 'react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'My App',
  description: 'My awesome app description',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Providers>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 3. Lazy Initialization Pattern

For external services, use lazy initialization to avoid build-time errors:

```typescript
let _client: SomeClient | null = null;

export const getClient = (): SomeClient => {
  if (!_client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY must be provided');
    }
    _client = new SomeClient(apiKey);
  }
  return _client;
};
```

### 4. Protected API Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your protected logic here
  return NextResponse.json({ data: 'protected data' });
}
```

---

## Quick Start Checklist

- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Set up Supabase project and run schema
- [ ] Configure OAuth provider
- [ ] Set up PostHog project
- [ ] Set up Stripe products and prices
- [ ] Create `.env.local` with all variables
- [ ] Implement providers wrapper
- [ ] Create root layout with providers
- [ ] Set up NextAuth routes
- [ ] Set up Stripe webhook
- [ ] Deploy to Vercel
- [ ] Configure Vercel environment variables
- [ ] Add Stripe webhook URL in Stripe dashboard

---

## Notes

- **Tailwind CSS v4**: Uses `@import "tailwindcss"` instead of the old `@tailwind` directives
- **Next.js 16**: Uses App Router exclusively (no Pages Router)
- **React 19**: Latest React with improved concurrent features
- **NextAuth v4**: JWT strategy for stateless sessions

This guide provides the foundation - extend based on your specific requirements!

