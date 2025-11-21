# Environment Variables Setup

This document outlines the required environment variables for the Sale Hunter application.

## Required Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

### 1. SERPAPI_API_KEY

**Purpose**: Used to fetch real-time shopping search results from Google Shopping and other e-commerce platforms.

**How to get it**:
1. Go to [SerpAPI](https://serpapi.com/)
2. Sign up for a free account
3. Navigate to [API Key Management](https://serpapi.com/manage-api-key)
4. Copy your API key

**Example**:
```
SERPAPI_API_KEY=abc123def456ghi789jkl012mno345pqr678
```

**Free Tier**: 100 searches per month

---

### 2. DATABASE_URL

**Purpose**: PostgreSQL connection string for storing deals, search history, and analysis results using Neon Database.

**How to get it**:
1. Go to [Neon Console](https://console.neon.tech)
2. Sign up or log in
3. Create a new project
4. Copy the connection string from the project dashboard
5. Ensure the connection string includes `?sslmode=require`

**Example**:
```
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Free Tier**: 0.5 GB storage, 1 project

---

### 3. OPENAI_API_KEY

**Purpose**: Used for AI-powered deal analysis and filtering using GPT models.

**How to get it**:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the key (you won't be able to see it again)

**Example**:
```
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890
```

**Note**: You'll need to add credits to your OpenAI account. Pricing varies by model.

---

## Setup Instructions

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values with your actual API keys and database URL.

3. **Important**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

4. Restart your development server after adding the environment variables:
   ```bash
   npm run dev
   ```

---

## Verifying Setup

After setting up your environment variables, you can verify they're loaded correctly by checking the application logs or by making a test API request through the UI.

### Test Each Service

1. **SerpAPI**: Try searching for a product to verify search results are returned
2. **Database**: Check that deals are being saved and retrieved
3. **OpenAI**: Verify that AI analysis appears in the results

---

## Security Notes

- **Never share your API keys** with anyone
- **Never commit `.env.local`** to version control
- **Rotate keys regularly** if you suspect they've been compromised
- **Use environment-specific keys** (development vs. production)
- Consider using a secrets manager in production (e.g., Vercel Environment Variables, AWS Secrets Manager)

---

## Troubleshooting

### "API key not found" errors
- Ensure `.env.local` is in the project root
- Verify variable names match exactly (case-sensitive)
- Restart your development server

### Database connection errors
- Verify your connection string includes `?sslmode=require`
- Check that your Neon project is active
- Ensure your IP is allowed (Neon allows all by default)

### OpenAI rate limit errors
- Check your OpenAI account has sufficient credits
- Verify you're using a valid API key
- Review your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

