// Side-effect stylesheet imports (`import './globals.css'`, `import 'lenis/dist/lenis.css'`).
// Newer TypeScript checks that side-effect imports resolve; Next.js bundles the CSS, so declare it.
declare module '*.css';
