This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Deployment Steps

1. **Create a GitHub Repository**:
   - Push your code to a GitHub repository
   - Make sure `.env.local` is in your `.gitignore` file to prevent exposing sensitive keys

2. **Set Up Vercel**:
   - Go to [Vercel](https://vercel.com/) and sign up/login
   - Click "New Project" and import your GitHub repository
   - Vercel will automatically detect Next.js and configure the build settings

3. **Configure Environment Variables**:
   - In the Vercel project settings, add the following environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GEMINI_API_KEY`

4. **Deploy**:
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a deployment URL

5. **Configure Supabase**:
   - Go to your Supabase project settings
   - Add your Vercel deployment URL to the allowed domains for authentication

### Troubleshooting

- If you encounter issues with PDF parsing, make sure the `pdf-parse` package is properly configured in your `next.config.ts`
- If authentication fails, check that your Supabase URL and keys are correct and that your deployment URL is added to Supabase's allowed domains
- For Gemini API issues, verify your API key is correct and properly set in the environment variables
