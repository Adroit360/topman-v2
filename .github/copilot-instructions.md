# 🧠 Copilot Instructions for Next.js SaaS Project (Senior Level)

---

## 🧰 Tech Stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- Supabase (auth + realtime)
- React Hook Form + Zod
- @t3-oss/env-nextjs

---

## 🧠 Thinking Rule (MANDATORY)

Before generating code:

- Fully understand the problem
- Identify edge cases
- Choose the simplest working solution
- Avoid over-engineering
- Prioritize clarity over cleverness

---

## 🏗️ Architecture Principles

- Use modular, feature-based architecture
- Separate:
  - UI (components)
  - Logic (services/actions)
  - Data layer (db)

- Prefer server components by default
- Use client components ONLY when necessary

---

## 📐 Architectural Decision Rules

- Use server components unless:
  - Interactivity is required
  - Browser APIs are needed

- Use Context API ONLY when:
  - State must be shared across multiple unrelated components

- Create a feature module when:
  - Logic grows beyond a single component
  - It has independent business logic or API

- Prefer duplication over wrong abstraction
- Do NOT abstract prematurely

---

## 🧱 Feature Implementation Contract (MANDATORY)

When building a feature, ALWAYS:

1. Start with a clear plan
2. Define:
   - Components
   - Hooks
   - Services (business logic)
   - Types
   - API routes / server actions

3. Structure under `/features/<feature-name>`:
   - components/
   - hooks/
   - services/
   - types/

4. Ensure:
   - Loading state
   - Error state
   - Empty state

5. Do NOT:
   - Put all logic in one file
   - Mix UI and business logic

---

## 📁 Folder Structure
- /app
- /components
- /features
- /lib
- /types
- /hooks
- /context
- /db


---

## 🧩 Component Design

- Use container/presenter pattern
- Keep logic out of UI components
- Prefer composition over inheritance

---

## ♻️ Reusability Rules

- Promote to `/components` only if used in 2+ features
- Otherwise keep inside feature folder
- Avoid premature global components

---

## 🏷️ Naming Conventions

- Components: PascalCase
- Hooks: useSomething
- Services: verb-based (e.g. getUsers, createInvoice)
- Types: PascalCase

- Files:
  - kebab-case for folders
  - camelCase or PascalCase for files

---

## 🧑‍💻 Code Rules

- Keep files small and focused
- Split when readability decreases
- Prefer named exports
- Use arrow functions
- Remove unused code (do NOT comment out dead code)

---

## 🧾 Types

- Store in `/types` or feature `/types`
- Avoid inline large types
- NO `any`

---

## 🎨 UI & Theming

- Use shadcn/ui
- Respect existing light/dark theme ALWAYS

- DO NOT hardcode colors
- Use semantic tokens:
  - bg-background
  - text-foreground
  - border-border

- UI must:
  - Work in both light & dark mode
  - Follow Apple-inspired design (minimal, elegant)

---

## 📱 Responsiveness

- Mobile-first approach
- Use responsive Tailwind classes
- Avoid fixed sizes
- Ensure accessibility across devices

---

## 🔌 API & Server Actions

- Prefer Server Actions over API routes when possible
- Keep DB logic inside services (`/features/*/services`)

- Server actions must:
  - Validate input (Zod)
  - Return structured response:
    `{ success: true, data }` or `{ success: false, error }`

- Never access DB directly from components

---

## 📝 Forms

- Use React Hook Form + Zod ALWAYS
- Validation schema must be separate
- No inline validation logic

- Structure:
  - schema.ts
  - form.tsx
  - actions.ts

- Must include:
  - Validation errors
  - Loading state
  - Success feedback

---

## 🗄️ Database (Drizzle ORM)

- Keep schema in `/db/schema`
- Queries must live in services layer
- Do NOT write queries in components

- Use:
  - Typed queries
  - Reusable query functions

---

## ⚡ Data Fetching & Caching

- Fetch on server whenever possible
- Avoid duplicate calls

- Use Next.js caching:
  - Static when possible
  - Dynamic when necessary

- Use:
  - Loading states
  - Error states
  - Suspense where appropriate

---

## ⚙️ State Management

- Prefer:
  - Local state
  - Hooks

- Use Context API ONLY when necessary

---

## 🌍 Environment Variables

- Use @t3-oss/env-nextjs for ALL env variables
- Do NOT access `process.env` directly
- Validate env variables at startup

---

## ⚠️ Error Handling

- Always handle errors explicitly
- Use structured responses:
  `{ success: false, error }`

- Do NOT expose sensitive errors to client

---

## 🔐 Security

- Validate all inputs (Zod)
- Never trust client data
- Protect server actions
- Prevent XSS and injection attacks

---

## 🚀 Performance

- Use lazy loading where appropriate
- Avoid unnecessary re-renders
- Optimize bundle size
- Measure before optimizing

---

## 🔍 SEO & Accessibility

- Use semantic HTML
- Add metadata properly
- Ensure keyboard accessibility

---

## 🪵 Logging

- Log errors on server side only
- Do NOT expose logs to client

---

## 🧹 Code Quality

- Follow ESLint & Prettier
- Avoid magic values
- Use constants

---

## 📈 Scalability

- Code must be easy to extend
- Avoid tight coupling
- Prefer composition over inheritance

---

## 🧬 Consistency Rule

- Follow existing patterns STRICTLY
- Do NOT introduce new patterns unnecessarily

---

## 🤖 Copilot Behavior Rules (CRITICAL)

When generating code:

- Follow this file STRICTLY
- Do NOT assume missing context
- Ask for clarification if unsure
- Generate code step-by-step for complex features
- Prefer incremental updates over full rewrites

---

## 🧑‍💻 Developer Experience

- Write self-documenting code
- Keep naming consistent
- Optimize for readability

---

## ⚙️ When Generating Code

- Do NOT rewrite entire files unnecessarily
- Respect structure and patterns
- Keep code clean and production-ready
