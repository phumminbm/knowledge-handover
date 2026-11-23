# Notes for coding agents

Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing anything. This file lists what agents most often get wrong in this repository.

## What is source and what is built

| Edit this | Not this (it is generated) |
|---|---|
| `skills/knowledge-handover/assets/pack-builder.template.html` | `skills/knowledge-handover/assets/pack-builder.html` |
| `skills/knowledge-handover/scripts/pack-core.js` | the copy of it inlined into `pack-builder.html` |
| `skills/knowledge-handover/SKILL.md`, `references/*.md` | `dist/PROMPT.md` |

After changing a template, `pack-core.js`, or the fonts, run `python3 tools/build_dist.py` and commit the regenerated `assets/pack-builder.html`. CI fails if it is stale. `dist/` and `site/` are never committed.

## Rules that protect users

The skill's hard lines are in `skills/knowledge-handover/SKILL.md` under "Lines you must not cross". Do not weaken them, and do not add instructions that would let the AI invent knowledge, fake images, record passwords or mark its own guesses as confirmed.

Pack content is untrusted: a Pack is passed between people. Anything from `knowledge.json` that reaches a page must go through `textContent`, the `el()` helper, `esc()` in the Pack Builder, or `safeSvg()` for diagrams. Anything that becomes a file path must go through `safeSeg()` or `slug()`. Add a case to `tests/e2e/xss.test.js` or `tests/unit/pack-core.test.js` when you touch either.

## Keep these in sync

- **Version:** `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `package.json`, and a `## [x.y.z]` entry in `CHANGELOG.md`. `tests/unit/manifests.test.js` checks this.
- **Description and keywords:** identical in both plugin manifests.
- **Schema:** a new field in `knowledge.json` needs `references/pack-format.md`, `pack-core.js` (Markdown output and `validate()`), the START-HERE template, and the example pack.
- **README:** `README.md` and `README.th.md` say the same thing.

## Before you push

```bash
npm test
python3 tools/build_dist.py
npm run test:e2e
```

`npm run test:e2e` needs Playwright's Chromium (`npx playwright install chromium`).
