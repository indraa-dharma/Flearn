# Flearn

Flearn is an AI Academic Study Planner that combines document understanding, Google Calendar two-way sync, and GLM-5.2 planning to help students decide what to study, when to study it, and why.

## Environment setup

Copy `.env.example` to `.env.local` and fill the real values. Never commit `.env.local`.

Required for the MVP:

- `DATABASE_URL` / `DIRECT_URL`: Supabase PostgreSQL connection strings from **Project Settings → Database**. Supabase publishable/secret API keys are not database passwords.
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `QWEN_API_KEY`, `QWEN_BASE_URL`, `QWEN_MODEL`

Security note: if an API key has ever been pasted into chat or committed, rotate it before demo/deployment.

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
