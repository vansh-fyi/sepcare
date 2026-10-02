# Production builds

Run `npm run build` to compile the production application with Next.js's supported Webpack builder, including TypeScript checks and route generation. Run `npm start` to serve the resulting build.

Webpack is selected explicitly because the current execution environment rejects the Turbopack PostCSS worker's port binding with `EPERM`, including an unsandboxed retry. This selection does not disable compilation or type checking. Next.js 16.3.5 documents `next build --webpack` in its shipped CLI guide at `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md`.

Use `npm run build:turbo` to reproduce or investigate the Turbopack build separately. Run the build commands sequentially because both write `.next`. Development continues to use `npm run dev` with Next.js's default bundler.
