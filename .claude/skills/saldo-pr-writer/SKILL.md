---
name: saldo-pr-writer
description: Use when pushing a branch or opening/editing a pull request in the Saldo (Investorukene) repo, to keep PRs tidy with a TL;DR and clean markdown.
---

# Pushing and writing pull requests

## Before you push
1. Work on a branch, never on `main`. Name it `type/short-topic`, e.g. `feat/heatmap-colors`, `fix/onboarding-button`, `chore/pr-review-workflow`.
2. Keep one goal per PR. Split unrelated changes.
3. Make small commits with clear messages: `type: what changed` (types: feat, fix, refactor, style, docs, chore, test).
4. Run the build/tests that exist. Do not push failing work unless the PR is a draft.
5. Rebase on the latest `main` and fix conflicts before you open the PR.

## PR title
- Format: `type: short summary` in sentence case, max ~60 characters.
- Say what the user gets, not the file names. Example: `feat: green/red heatmap for daily balance`.

## PR body template
Use exactly these sections. Leave out a section only if it is truly empty.

```markdown
## TL;DR
One or two sentences: what changed and why.

## Changes
- Short bullet per change, user-facing first
- Max ~7 bullets; group small things

## Screenshots
| Before | After |
|---|---|
| img | img |

## How to test
1. Step
2. Step
3. Expected result

## Notes
- Risks, follow-ups, or open questions
- Linked Trello card: <link>
```

## Markdown rules
- Use `##` headings only, no deeper than `###`.
- Bullets are short fragments, no paragraphs inside bullets.
- Put code, file paths, and commands in `backticks`; longer code in fenced blocks with a language.
- Use tables only for before/after or comparisons.
- No walls of text, no emoji spam, no repeated info.
- Link the Trello card and any related issue or PR.

## After opening
- Assign the author (Kasper by default) and request a review.
- Use draft PRs for unfinished work; mark ready when done.
- When you push fixes after review, update the TL;DR and Changes if the scope changed.
