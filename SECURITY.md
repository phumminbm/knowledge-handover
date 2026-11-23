# Security policy

## Supported versions

Only the latest release receives fixes.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private reporting instead:
**Security → Report a vulnerability** on this repository
([direct link](https://github.com/phumminbm/knowledge-handover/security/advisories/new)).

Include what an attacker controls (for example, a crafted save block or `knowledge.json`), what happens, and the steps to reproduce. You can expect a first reply within 7 days.

## What counts

Knowledge Packs are passed between people, so treat their content as untrusted. In scope:

- Code running when someone opens `START-HERE.html`, the Pack Builder or a built Pack.
- A save block or `knowledge.json` that makes the builder write files outside the output folder.
- A Pack or a page sending data anywhere. The pages are designed to work offline and make no network requests.
- Instructions in `SKILL.md` or `references/` that lead an AI to record passwords or private data it is told to leave out.

Out of scope: what an AI host does with the conversation (see [PRIVACY.md](PRIVACY.md)), and social engineering of the people involved in a handover.
