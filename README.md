# Mareta Webshop

Moderna webshop aplikacija za prodaju sunčanih naočala, izgrađena sa Next.js 14, Supabase i Stripe.

## Funkcionalnosti

- ✅ Autentifikacija korisnika (Supabase Auth)
- ✅ Pregled proizvoda sa pretragom i filtrima
- ✅ Shopping cart (LocalStorage)
- ✅ Checkout proces sa Stripe integracijom
- ✅ Upravljanje narudžbama
- ✅ Admin panel za upravljanje proizvodima
- ✅ Responsive dizajn

## Tehnologije

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Stripe
- **Deployment**: Vercel

## Setup

### 1. Kloniraj repozitorij

```bash
git clone <repository-url>
cd MaretaWebShop
```

### 2. Instaliraj dependencies

```bash
npm install
```

### 3. Konfiguriraj environment varijable

Kreiraj `.env.local` fajl:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend (kontakt forma)
RESEND_API_KEY=re_xxxx
RESEND_FROM=Mareta <noreply@tvoja-domena.hr>
CONTACT_EMAIL_TO=info@tvoja-domena.hr
```

### 4. Setup Supabase

1. Kreiraj novi projekt na [Supabase](https://supabase.com)
2. Pokreni migracije iz `supabase/migrations/001_initial_schema.sql`
3. Kopiraj URL i keys u `.env.local`

### 5. Setup Stripe

1. Kreiraj account na [Stripe](https://stripe.com)
2. Dobij API keys iz Stripe dashboarda (Developers → API keys)
3. Dodaj keys u `.env.local`
4. **Webhook** (za `payment_intent.succeeded`): Stripe Dashboard → Webhooks → Add endpoint → URL: `https://tvojadomena.com/api/webhooks/stripe`. Za lokalno testiranje: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI)

### 6. Pokreni development server

```bash
npm run dev
```

Aplikacija će biti dostupna na [http://localhost:3000](http://localhost:3000)

## Deployment na Vercel

1. Push koda na GitHub
2. Connect repository sa Vercel
3. Dodaj environment varijable u Vercel projektu
4. Deploy

## Struktura projekta

```
├── app/                    # Next.js App Router
│   ├── (shop)/            # Shop routes
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React komponente
├── lib/                   # Utility funkcije
├── types/                 # TypeScript tipovi
└── supabase/             # Database migrations
```

## Napomene

- Instagram scraping zahtijeva dodatnu konfiguraciju zbog Instagram-ovih anti-scraping mjera
- Preporučujemo ručno dodavanje proizvoda kroz admin panel
- Za production, konfiguriraj Stripe webhook endpoint

## Licenca

MIT

