@AGENTS.md

# M-IAE — Group Expense Tracker (Phase 4)

## Stack
- Next.js 15 App Router + TypeScript + Tailwind CSS (Liquid Glass: `backdrop-blur bg-white/20 border-white/30`)
- Zustand 5 (global store, no Provider)
- Supabase (PostgreSQL + Auth + RLS) — lazy client singleton via `getSupabaseClient()` in `lib/supabase.ts`
- Adapter Pattern: `StorageAdapter` interface → `SupabaseAdapter` (`lib/storage/supabaseAdapter.ts`)

## Database Schema (Supabase)

| Table | Key Columns |
|---|---|
| `groups` | `id uuid PK`, `name text`, `invite_code text unique`, `created_at` |
| `group_members` | `group_id uuid FK`, `user_id uuid FK (auth.users)`, `display_name text`, PK both |
| `expenses` | `id text PK`, `description`, `amount numeric`, `category`, `paid_by_user_id text`, `splits jsonb`, `date text`, `note`, `created_at text`, `group_id uuid FK` |

`splits` JSONB format: `[{"userId":"uuid","amount":166.67}, ...]` — sum = total expense amount

**Stored functions (SECURITY DEFINER — bypass RLS chicken-and-egg):**
- `create_group(p_name, p_display_name)` → returns `{id, invite_code, name}`
- `join_group(p_invite_code, p_display_name)` → returns `{id, invite_code, name}`

## Key Patterns

### Lazy client (critical — avoids static generation crash)
```typescript
// lib/supabase.ts — init at runtime, NOT at module import
let _client = null;
export function getSupabaseClient() { if (!_client) _client = createClient(url, key); return _client; }
```

### groupId scoping (multi-group: 1 user can belong to many groups)
`SupabaseAdapter` has `public groupId: string | null = null` and `currentUserId: string | null = null`.
Store casts: `const adapter = storage as SupabaseAdapter; // store/expenseStore.ts`
Active group persisted in `localStorage("m-iae-active-group")`.

### DB ↔ App column mapping
`paid_by_user_id` ↔ `paidByUserId`, `splits` (JSONB) ↔ `splits: ExpenseSplit[]`, `created_at` ↔ `createdAt`
Handled by `rowToExpense()` and `expenseToRow()` in supabaseAdapter.ts.

### Type casting (no generated DB types)
- `getSupabaseClient() as any` — relation joins in AppShell, group_members queries
- `.rpc as any` — stored function calls in /groups page
- Provide explicit local type annotation for response shape

### Route protection (AppShell)
```
PUBLIC_PATHS = ["/login"]    GROUP_PATHS = ["/groups"]
no session → /login
session + groupsChecked + no activeGroupId → /groups
/groups always accessible when authenticated (group switcher)
```

## Store State (expenseStore.ts)
`groups[] | activeGroupId | members[] | groupName | groupsChecked | currentUserId | expenses[] | isLoaded`
- `setGroups(groups)` — auto-select from localStorage or first group
- `setActiveGroup(groupId)` — switch active group, persist to localStorage, reset isLoaded
- `addGroup(group)` — after create/join
- `resetStore()` — full reset on logout

## Settlement Algorithm (lib/settlement.ts)
N-way Splitwise-style greedy debt simplification:
1. net[user] = sum(paid) - sum(owed from splits)
2. Separate creditors (net>0) / debtors (net<0)
3. Greedy match to minimize transaction count

## Routes
`/` dashboard · `/expenses` list · `/expenses/new` add · `/expenses/[id]` edit · `/settlement` N-way summary · `/settings` group name + display name + members + invite code + switch group + logout · `/login` email/pw + signup · `/groups` group switcher + create + join
