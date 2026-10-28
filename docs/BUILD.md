# Production builds

Run `npm run build` to compile the production application with Next.js's supported Webpack builder, including TypeScript checks and route generation. Run `npm start` to serve the resulting build.

Webpack is selected explicitly because the current execution environment rejects the Turbopack PostCSS worker's port binding with `EPERM`, including an unsandboxed retry. This selection does not disable compilation or type checking. Next.js 16.3.5 documents `next build --webpack` in its shipped CLI guide at `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md`.

Use `npm run build:turbo` to reproduce or investigate the Turbopack build separately. Run the build commands sequentially because both write `.next`. Development continues to use `npm run dev` with Next.js's default bundler.

## Supabase keep-alive

`vercel.json` schedules `/api/cron/supabase-keep-alive` daily at midnight UTC (05:30 IST). On Vercel Hobby, invocation can occur anywhere within that hour. The endpoint reads at most one device ID from Supabase, including when the table is empty, and returns only a success status. It does not modify data. Database errors or the 10-second query timeout return HTTP 503 and log the failure.

Before deploying, generate a secret with `openssl rand -hex 32` and add it as `CRON_SECRET` to the Vercel project's **Production** environment variables. The existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must also be configured. Redeploy to activate the schedule and environment variables. Vercel sends the secret automatically in the Authorization header; the endpoint rejects requests if the secret is missing or incorrect.

Cron jobs run on production deployments, not local development or preview deployments. Check the job in the Vercel project's Cron Jobs settings and function logs after deploying; you can also trigger it manually there. Failed jobs are not automatically retried.

This schedule fits [Vercel Hobby's daily cron limit](https://vercel.com/docs/cron-jobs/usage-and-pricing). It provides regular database activity to help prevent inactivity pausing, but [Supabase does not guarantee a fixed request threshold](https://supabase.com/docs/guides/platform/free-project-pausing). If the project is already paused, restore it in the Supabase dashboard first.
