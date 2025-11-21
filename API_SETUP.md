# API Setup Guide

## OpenAI API Configuration

This application uses the OpenAI API to generate intelligent search plans.

### Setup Steps

1. **Get your OpenAI API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key or use an existing one

2. **Configure Environment Variables:**
   
   Create a `.env.local` file in the root directory:
   
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Restart the development server:**
   
   ```bash
   npm run dev
   ```

### API Route Details

The `/api/agent` endpoint accepts POST requests with:

```typescript
{
  "sites": string[],          // Array of shop URLs/names
  "minDiscount": number,      // Minimum discount percentage (0-100)
  "maxDiscount": number,      // Maximum discount percentage (0-100)
  "keywords": string          // Optional: product keywords
}
```

And returns:

```typescript
{
  "plan": string,            // AI-generated search plan
  "debugInfo": {
    "receivedParams": {...},
    "sitesCount": number,
    "discountRange": string,
    "hasKeywords": boolean,
    "timestamp": string
  }
}
```

### Error Handling

The API includes comprehensive error handling for:
- Missing API key
- Invalid request format
- Invalid discount ranges
- OpenAI API errors

All errors return meaningful messages to help with debugging.

### Model Used

Currently using: **gpt-4o-mini**

This model provides a good balance between:
- Cost efficiency
- Response quality
- Speed

You can modify the model in `/app/api/agent/route.ts` if needed.

## Testing

To test the API:

1. Fill in the form with shop names
2. Set discount range
3. Optionally add keywords
4. Click "Run Search"

The AI plan will appear below the form showing:
- Which sites will be checked
- What filters will be applied
- Expected search approach

## Troubleshooting

**Error: "OpenAI API key not configured"**
- Make sure you created `.env.local` file
- Verify the API key is correctly set
- Restart your dev server

**Error: "OpenAI API error"**
- Check your API key is valid
- Verify you have credits in your OpenAI account
- Check OpenAI status page

**Error: "Invalid discount range"**
- Min discount must be ≥ 0
- Max discount must be ≤ 100
- Min must be ≤ Max

