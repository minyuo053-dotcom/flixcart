# FlexiCart - Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- Node.js 20+
- MySQL database
- SMTP credentials (for OTP emails)

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/flexicart

# Required: signs login session cookies. Set this to any long random string,
# e.g. `openssl rand -hex 32`. Without it, sign in/sign up will not work.
APP_SECRET=replace-with-a-long-random-string

# SMTP (for sending OTP emails). If omitted, OTP codes are logged to the
# server console / returned in the response, so login still works for testing.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Login/signup on this site works via email + one-time code (OTP) — there is no
separate password. Entering a code for a new email creates the account
automatically; entering it again for an existing email logs you back in.

### 3. Database Setup

```bash
npm install
npm run db:push
npx tsx db/seed.ts
```

### 4. Build

```bash
npm run build
```

### 5. Deploy

```bash
npm i -g vercel
vercel --prod
```

Or deploy via Vercel Dashboard:
1. Import your Git repository
2. Set environment variables in Vercel dashboard
3. Build command: `npm run build`
4. Output directory: `dist/public`

## Features

- **Futuristic neon-themed UI** with dark navy palette
- **Animated floating cart** that transforms between product categories on hover
- **Category orbit** with circular navigation
- **Full-text search** across all products
- **Shopping cart** with animated add/remove transitions
- **Gamified checkout** with progress bar, card swipe animation, and delivery truck animation
- **Two payment options**: Secure card payment + Pay on Delivery
- **Order success** celebration with particles and confetti
- **OTP email verification** with glowing animated inputs and lock/unlock animation
- **AI chatbot assistant** with glow effects and typing indicators
- **Fully responsive** design for mobile, tablet, and desktop

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- tRPC + Hono + Drizzle ORM
- MySQL database
- Nodemailer for SMTP

## API Endpoints (tRPC)

- `auth.*` - OAuth authentication
- `otp.send` - Send OTP to email
- `otp.verify` - Verify OTP code
- `category.list` - List all categories
- `product.list` - List/search products
- `product.search` - Quick product search
- `cart.*` - Cart CRUD operations
- `order.create` - Create new order
- `payment.processCard` - Process card payment
- `payment.processCOD` - Process pay-on-delivery
- `chat.send` - Send message to chatbot
