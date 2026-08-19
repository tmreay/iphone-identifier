# AGENTS.md

Rules for AI agents working in this repository.

## Read first

[README.md](README.md) covers the requirements, setup, available scripts, and
repository layout. [SPEC.md](SPEC.md) is the specification. Read both before
making changes.

## Branches and worktrees

- Never commit to `main`. All work happens on a separate branch.
- Create that branch in its own git worktree, so `main` stays checked out and
  untouched in the primary working directory:

```bash
git worktree add ../iphone-identifier-<topic> -b <topic>
```

- Run `npm install` inside the new worktree before working in it.
- When the work is complete, open a pull request against `main`:

```bash
gh pr create --base main
```

- Remove the worktree once the PR is merged:

```bash
git worktree remove ../iphone-identifier-<topic>
```

## Before pushing to origin

Run these from the worktree and fix anything they report. Do not push or open a
PR until both are clean:

```bash
npm run format
```

```bash
npm run lint:fix
```

`npm run lint:fix` fixes what it can automatically; resolve the remaining
errors by hand rather than suppressing them. CI runs `npm run ci`
(`format:check`, `lint`, `typecheck`, `test`), so running the full check
locally first avoids a failed build:

```bash
npm run ci
```
