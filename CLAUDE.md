@AGENTS.md

# M-IAE — Couples Expense Tracker

## Stack
- Next.js 15 App Router + TypeScript + Tailwind CSS (Liquid Glass: `backdrop-blur bg-white/20 border-white/30`)
- Zustand 5 (global store, no Provider)
- Supabase (PostgreSQL + Auth + RLS) — lazy client singleton via `getSupabaseClient()` in `lib/supabase.ts`
- Adapter Pattern: `StorageAdapter` interface → `SupabaseAdapter` (`lib/storage/supabaseAdapter.ts`)

## Database Schema (Supabase)

| Table | Key Columns |
|---|---|
| `couples` | `id uuid PK`, `invite_code text unique`, `my_name`, `partner_name` |
| `couple_members` | `couple_id uuid FK`, `user_id uuid FK (auth.users)`, PK both |
| `expenses` | `id text PK`, `description`, `amount numeric`, `category`, `paid_by`, `split_me int`, `split_partner int`, `date text`, `note`, `created_at text`, `couple_id uuid FK` |

Config (my_name, partner_name) lives in `couples` table — no separate config table.

**Stored functions (SECURITY DEFINER):**
- `create_couple(p_my_name, p_partner_name)` → returns `{id, invite_code}`
- `join_couple(p_invite_code)` → returns `{id, invite_code}`
RLS requires these because user isn't a member yet when creating a couple (chicken-and-egg).

## Key Patterns

### Lazy client (critical — avoids static generation crash)
```typescript
// lib/supabase.ts — init at runtime, NOT at module import
let _client = null;
export function getSupabaseClient() { if (!_client) _client = createClient(url, key); return _client; }
```

### coupleId scoping
`SupabaseAdapter` has `public coupleId: string | null = null`. Store casts:
```typescript
const adapter = storage as SupabaseAdapter; // store/expenseStore.ts
adapter.coupleId = id; // set in setCouple() / clearCouple() / resetStore()
```
All DB queries guard: `if (!this.coupleId) return [];`

### DB ↔ App column mapping
`paid_by` ↔ `paidBy`, `split_me/split_partner` ↔ `splitRatio.me/partner`, `created_at` ↔ `createdAt`
Handled by `rowToExpense()` and `expenseToRow()` in supabaseAdapter.ts.

### Type casting (no generated DB types)
- `getSupabaseClient() as any` — relation joins in AppShell
- `.rpc as any` — stored function calls in setup/page.tsx
- Provide explicit local type annotation for response shape

### Route protection (AppShell)
```
PUBLIC_PATHS = ["/login"]    SETUP_PATHS = ["/setup"]
no session → /login
session + no coupleId → /setup
session + coupleId + on /setup → /
```

## Store State (expenseStore.ts)
`coupleId | inviteCode | coupleChecked | expenses | config | isLoaded`
- `setCouple(id, inviteCode)` — sets adapter.coupleId, resets isLoaded → triggers re-fetch
- `clearCouple()` — coupleChecked=true, coupleId=null
- `resetStore()` — full reset, coupleChecked=false (logout)

## Zustand store action: load()
Guards `if (!adapter.coupleId) return;` before fetching. Called by `useExpenses` hook when `!isLoaded`.

## Routes
`/` dashboard · `/expenses` list · `/expenses/new` add · `/expenses/[id]` edit · `/settlement` summary · `/settings` invite code + names + logout · `/login` email/pw + signup · `/setup` create or join couple
