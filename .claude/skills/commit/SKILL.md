---
name: commit
description: Create a git commit in this repo following its message convention. Use when the user asks to commit or stage changes - "commit", "haz commit", "commitea esto", "sube los cambios".
allowed-tools: Bash, Read, Grep, Glob
---

# Commit

## 1. Gather context

In a single message, run in parallel:

```bash
git status
git diff                 # unstaged
git diff --staged        # already staged
git log --oneline -10    # recent message style
```

Read the actual diff before writing a message. The subject must describe what the
change does, which you cannot infer from filenames alone.

## 2. Guards before staging

- **Never stage `.env.local`.** It is tracked in this repo and holds `DATABASE_URL`,
  `SUPABSE_API_URL` and `SUPABSE_PUBLIC_API_KEY`. If it shows as modified, leave it
  out and tell the user.
- **Stage explicit paths.** Use `git add src/... file.ts`, never `git add -A` or
  `git add .` — those would sweep in `.env.local` and anything else untracked.
- Never stage `.vercel/`, `dist/`, `node_modules/`.
- This repo's history is linear on `main`; every commit lands there directly. Stay on
  `main` unless the user asks for a branch.

## 3. Typecheck when `src/` changed

There is no test suite and no linter — `npm run build` is the only automated check,
and `tsconfig.json` runs `strict` + `noImplicitAny` + `noUnusedParameters`, which
breaks easily. If the staged change touches `src/**/*.ts`:

```bash
npm run build
```

If it fails, fix it before committing. Report the failure if the user wants to commit anyway.

## 4. Message format

A **single subject line, no body**. English, lowercase (except proper nouns), no
trailing period, no conventional-commits prefix (no `feat:`, `fix(scope):`), ~72 chars max.

Patterns this repo uses:

| Pattern | Example from history |
| --- | --- |
| `new <thing>` | `new employee billing endpoint` |
| `add <thing>` | `add new delete event` |
| `fix <thing>` | `fix settle` |
| `make <x> <y>` | `make delete-hour endpoint public` |
| `remove <x>` | `remove verify token` |
| `<a>, <b> and <c>` | `hours approval, employee assignments and events by cc` |

Name things as the API and domain name them — endpoint paths from the routers
(`get-events`, `delete-hour`, `add-edit-event`), model names (`EventBilling`,
`Hour`), domain terms (`settle`, `aux`) — not file paths or function names.

**Do not write** `changes`, `new changes`, `update`, `wip`, or `fix bug`. The early
history is full of these and they are useless when bisecting. Describe the change.

```
good:  make status optional and add owner/description search to get-events
good:  new hour classifier with timezone, overlap validation and per-day aux
bad:   update endpoints
bad:   feat(hours): add overlap validation
```

## 5. Attribution trailer

End the message with the `Co-Authored-By:` line that **this session's** attribution
guidance specifies (it arrives in a system reminder and names the current model).
Do not copy the trailer from an older commit — those name whichever model wrote them.

## 6. Commit

Pass the message via a quoted heredoc through the Bash tool:

```bash
git commit -F - <<'MSG'
make delete-hour endpoint public

Co-Authored-By: <line from this session's attribution guidance>
MSG
```

In PowerShell use a single-quoted here-string instead, with `'@` at column 0:

```powershell
git commit -m @'
make delete-hour endpoint public

Co-Authored-By: <line from this session's attribution guidance>
'@
```

Never pass `--no-verify` or `--no-gpg-sign`. Prefer a new commit over `--amend`.

## 7. Verify and stop

```bash
git log -1 --stat
git status
```

Confirm the commit landed and that `.env.local` is not in it. **Do not push** unless
the user asks — this repo is linked to Vercel (`.vercel/project.json`), so a push to
`main` may trigger a deploy.
