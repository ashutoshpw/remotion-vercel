# Remotion + Better Auth on Vercel

This app turns the Remotion Vercel template into a small authenticated workspace for video teams.

## What’s included

- **better-auth** email/password authentication
- **Teams** that act like lightweight Vercel-style workspaces
- **Projects** that group your videos and saved assets
- **Reusable assets** that can be attached to future renders
- **Remotion rendering on Vercel Sandbox** with outputs uploaded to Vercel Blob

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require
BETTER_AUTH_SECRET=replace-me-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### Production requirements

To make the app production-ready on Vercel:

1. Provision a **Neon Postgres** database
2. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`, and `BLOB_READ_WRITE_TOKEN`
3. Push the Drizzle schema before first use:

```bash
npm run db:push
```

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:push
```

## Local development

1. Create a Neon database and copy its connection string into `.env.local` as `DATABASE_URL`
2. Run `npm install`
3. Run `npm run db:push`
4. Start the app with `npm run dev`
5. Create an account, then create a team, a project, and optionally add a reusable image asset

## Deploy to Vercel

- Attach a **public Blob store** to the project so `BLOB_READ_WRITE_TOKEN` is available
- Create a **Neon** database and add its `DATABASE_URL` to the Vercel project
- Add `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and `BETTER_AUTH_URL`
- After the env vars are set, run `npm run db:push` against the production database before accepting traffic

## Deployment checklist

Use this sequence when deploying the repo:

1. **Create Neon database**
   - Create a new project/database in Neon
   - Copy the serverless Postgres connection string into `DATABASE_URL`
2. **Configure Vercel env vars**
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `BETTER_AUTH_URL`
   - `BLOB_READ_WRITE_TOKEN`
3. **Push schema**
   ```bash
   npm run db:push
   ```
4. **Build / deploy**
   ```bash
   npm run build
   ```
5. **Smoke test**
   - Create an account
   - Create a team
   - Create a project
   - Save an asset
   - Trigger a render

## Notes

- Saved assets are referenced by URL so they can be reused across multiple renders in the same project
- Every render is stored as a project video record with status, size, and download URL
