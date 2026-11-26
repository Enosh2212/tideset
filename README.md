# Tideset (Bothway)

Tideset helps clients and service providers plan milestone agreements around cash flow and delivery. The current app interface uses the Bothway name. The project was built for the Build What's Next with PayPal and AI Hackathon.

- **Agreement planning:** OpenRouter proposes milestone schedules from a project brief. A deterministic solver checks the total in integer cents, buyer liquidity, deposit floors, and provider exposure. It can produce a fallback plan when the AI provider is unavailable.
- **Stress testing:** Simulate delayed income or changes in cost before approval and review the resulting schedule.
- **Milestone workflows:** Invite the other party, approve an agreement, submit deliverables, request revisions, and track settlement.
- **PayPal Sandbox:** Orders and Invoicing APIs, server-side capture checks, and webhook reconciliation. Local simulation is available for development.

Built with Next.js, React, TypeScript, Prisma, and SQLite.

## Local setup

Use Node.js 22 or 24 and npm.

1. Clone `https://github.com/Enosh2212/tideset.git` and enter the project folder.
2. Run `npm ci`.
3. Copy `.env.example` to `.env`. Set `SESSION_SECRET` to a random value. You can generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Run `npm run prisma:generate`, `npm run prisma:push`, and `npx tsx prisma/seed.ts`.
5. Run `npm run dev` and open <http://localhost:3000>.

Set `OPENROUTER_API_KEY` to enable AI proposals. Set your own PayPal Sandbox credentials and webhook ID to exercise the external payment integration. Keep demo access disabled in any deployment connected to real accounts.

## Tests

Run the solver checks with `npx tsx --test tests/financial_invariants.test.ts`. The broader suite uses seeded local data and some tests expect a running development server. Use a disposable database for integration tests. Browser tests run with `npm run test:e2e` after installing Playwright Chromium.

Crowd animation adapted from [Skiper UI](https://skiper-ui.com). Character illustrations from [Open Peeps](https://www.openpeeps.com/) by Pablo Stanley. See [LICENSE](LICENSE) for the project license.
