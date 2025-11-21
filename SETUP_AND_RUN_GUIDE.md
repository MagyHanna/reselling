# Sale Hunter - Complete Setup & Run Guide

## ✅ Project Status: READY TO RUN

All type errors have been fixed, imports are correct, and naming is consistent throughout the codebase.

---

## 📋 Summary of Changes Made

### 1. **Fixed Naming Inconsistencies**
   - **Issue**: Database schema used `snake_case` (e.g., `product_link`, `image_url`) but API routes were using `camelCase`
   - **Solution**: Updated all database column references to use `snake_case` consistently:
     - `productLink` → `product_link`
     - `imageUrl` → `image_url`
     - `originalPrice` → `original_price`
     - `discountPercent` → `discount_percent`
     - `searchQuery` → `search_query`

### 2. **Added Comprehensive Comments**
   - Added detailed JSDoc comments to all API routes explaining:
     - Endpoint behavior
     - Request/response schemas
     - Data flow
   - Added inline comments for complex logic
   - Documented database schema with field descriptions

### 3. **Type Safety Verification**
   - ✅ Ran TypeScript compiler: **0 errors**
   - ✅ All imports use correct `@/` path aliases
   - ✅ All types are properly exported and imported
   - ✅ No linter errors detected

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# SerpAPI - For fetching shopping deals from Google Shopping
# Get your API key from: https://serpapi.com/manage-api-key
SERPAPI_API_KEY=your_serpapi_api_key_here

# Neon Database - PostgreSQL connection string
# Get your connection string from: https://console.neon.tech
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# OpenAI API - For AI-powered deal analysis (RAG)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
```

**📖 Detailed instructions**: See `ENV_SETUP.md` for detailed setup instructions for each API key.

### Step 3: Set Up Database

Run these commands in order:

```bash
# Generate database migration files from schema
npm run db:generate

# Push schema to your Neon database (creates tables)
npm run db:push
```

**What this does**:
- `db:generate`: Creates SQL migration files in the `drizzle/` folder based on your schema
- `db:push`: Applies the schema directly to your database, creating the `deals` table

**Optional**: View your database in Drizzle Studio
```bash
npm run db:studio
```

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Application

### Test 1: Search for Deals
1. Enter a search query (e.g., "wireless headphones", "laptop", "running shoes")
2. Set a minimum discount percentage (e.g., 20%)
3. Click "Search Deals"
4. **Expected**: Deals from Google Shopping appear in cards below
5. **Verify**: Deals are saved to your database

### Test 2: AI Analysis (RAG)
1. After searching for deals, scroll down to "AI Deal Analysis"
2. Enter a question like:
   - "Which deal offers the best value?"
   - "What are the top 3 cheapest options?"
   - "Which product has the highest discount?"
3. Click "Analyze Deals"
4. **Expected**: AI-generated analysis appears based on the deals

### Test 3: Database Persistence
1. Search for deals
2. Refresh the page
3. Ask a question in AI Analysis
4. **Expected**: Analysis works even after refresh (uses deals stored in DB)

---

## 📁 Project Structure

```
/Users/magyhanna/projects/reselling/
├── app/
│   ├── api/
│   │   ├── agent/route.ts           # AI search plan generator
│   │   ├── analyze-deals/route.ts   # RAG endpoint for deal analysis
│   │   └── deals/route.ts           # Fetch & store deals from SerpAPI
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main application page
│   └── globals.css                  # Global styles (Tailwind)
│
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── slider.tsx
│   │   ├── table.tsx
│   │   └── textarea.tsx
│   ├── results-table.tsx            # (unused, kept for reference)
│   └── search-form.tsx              # (unused, kept for reference)
│
├── db/
│   └── index.ts                     # Database connection (Neon + Drizzle)
│
├── drizzle/
│   ├── 0000_common_spirit.sql       # Generated migration
│   └── meta/                        # Migration metadata
│
├── lib/
│   ├── serpapi.ts                   # SerpAPI integration
│   └── utils.ts                     # Utility functions (cn helper)
│
├── schema/
│   ├── deals.ts                     # Deals table schema
│   └── index.ts                     # Schema exports
│
├── types/
│   └── deals.ts                     # TypeScript type definitions
│
├── .env.local                       # ⚠️  YOU MUST CREATE THIS
├── .gitignore                       # Ignores .env.local
├── drizzle.config.ts                # Drizzle ORM configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
└── postcss.config.mjs               # PostCSS (Tailwind v4)
```

---

## 🔧 Available NPM Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate migration files from schema
npm run db:push      # Push schema directly to database
npm run db:migrate   # Run migrations (alternative to db:push)
npm run db:studio    # Open Drizzle Studio (database GUI)
```

---

## 🔍 API Endpoints Documentation

### `POST /api/deals`
**Purpose**: Fetch shopping deals from SerpAPI and store them in the database.

**Request Body**:
```json
{
  "query": "wireless headphones",
  "minDiscount": 20,
  "category": "electronics",
  "limit": 30
}
```

**Response**:
```json
{
  "deals": [ /* Deal[] */ ],
  "count": 15,
  "totalFetched": 30
}
```

---

### `POST /api/analyze-deals`
**Purpose**: Use AI (OpenAI GPT) to analyze deals from the database using RAG.

**Request Body**:
```json
{
  "question": "Which deal offers the best value for money?",
  "query": "wireless headphones",
  "minDiscount": 20
}
```

**Response**:
```json
{
  "answer": "Based on the deals analyzed...",
  "dealsAnalyzed": 15
}
```

---

### `POST /api/agent`
**Purpose**: Generate AI-powered search plans (used by search-form component).

**Request Body**:
```json
{
  "sites": ["Nike", "Amazon", "Best Buy"],
  "minDiscount": 20,
  "maxDiscount": 50,
  "keywords": "running shoes"
}
```

**Response**:
```json
{
  "plan": "I'll search these sites...",
  "debugInfo": { /* ... */ }
}
```

---

## 📊 Database Schema

### `deals` Table

| Column            | Type                  | Description                                    |
|-------------------|-----------------------|------------------------------------------------|
| `id`              | `serial` (PK)         | Auto-incrementing primary key                  |
| `title`           | `text`                | Product title                                  |
| `source`          | `text`                | Store/marketplace name                         |
| `product_link`    | `text`                | URL to product page                            |
| `image_url`       | `text`                | Product image URL                              |
| `price`           | `numeric(10,2)`       | Current sale price                             |
| `original_price`  | `numeric(10,2)`       | Original price before discount (nullable)      |
| `discount_percent`| `numeric(5,2)`        | Calculated discount percentage (nullable)      |
| `currency`        | `text`                | Currency code (default: "USD")                 |
| `search_query`    | `text`                | User's original search query                   |
| `category`        | `text`                | Optional category (nullable)                   |
| `created_at`      | `timestamp`           | When deal was added to database                |

---

## ⚠️ Important Notes

### Type Consistency
- **Database**: Uses `snake_case` for column names (PostgreSQL convention)
- **TypeScript**: Properties in types use `snake_case` to match database
- **Frontend**: The `Deal` type in `/types/deals.ts` uses `camelCase` for UI consistency
- **Mapping**: API routes handle the conversion between database and frontend formats

### Environment Variables
- **Never commit** `.env.local` to git (already in `.gitignore`)
- All three API keys are **required** for full functionality
- The app will throw errors if environment variables are missing

### Database
- Uses **Neon** (serverless PostgreSQL)
- **Drizzle ORM** for type-safe queries
- Migration files are in `/drizzle` folder
- Schema definition in `/schema/deals.ts`

---

## 🐛 Troubleshooting

### "SERPAPI_API_KEY is not set"
- Ensure `.env.local` exists in project root
- Check variable name is exactly `SERPAPI_API_KEY`
- Restart dev server after adding environment variables

### "DATABASE_URL is not set"
- Get connection string from [Neon Console](https://console.neon.tech)
- Ensure it includes `?sslmode=require` at the end
- Run `npm run db:push` after setting DATABASE_URL

### "OpenAI API error"
- Check your OpenAI API key is valid
- Ensure you have credits in your OpenAI account
- Visit [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### TypeScript Errors
- Run: `npm run build` to check for type errors
- Or: `npx tsc --noEmit` for type checking without building

### Database Connection Errors
- Verify Neon project is active
- Check connection string format
- Ensure your IP is allowed (Neon allows all IPs by default)

---

## 🎯 Next Steps

After getting the app running, you can:

1. **Test all features** using the testing guide above
2. **Customize the UI** in `app/page.tsx`
3. **Adjust search parameters** in `lib/serpapi.ts`
4. **Modify AI prompts** in `app/api/analyze-deals/route.ts`
5. **Add new features**:
   - Price alerts
   - Deal favorites
   - Export to CSV
   - Email notifications
   - Price history tracking

---

## 📚 Additional Documentation

- **ENV_SETUP.md**: Detailed environment variable setup
- **SALE_HUNTER_README.md**: UI component documentation
- **SHADCN_SETUP.md**: shadcn/ui setup details
- **TAILWIND_CONFIG_SUMMARY.md**: Tailwind CSS v4 configuration

---

## ✅ Pre-Flight Checklist

Before running `npm run dev`:

- [ ] Node.js and npm are installed
- [ ] Ran `npm install`
- [ ] Created `.env.local` with all three API keys
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push`
- [ ] Verified TypeScript has no errors

---

## 🎉 Ready to Launch!

Your Sale Hunter application is now ready to run. Execute:

```bash
npm run dev
```

Then visit: **http://localhost:3000**

Happy deal hunting! 🛍️

