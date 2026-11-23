## What and why

<!-- What does this change, and what problem does it solve? -->

## Checks

- [ ] `npm test` passes
- [ ] `python3 tools/build_dist.py` run, and the regenerated `assets/pack-builder.html` is committed if it changed
- [ ] `npm run test:e2e` passes (needed when templates or `pack-core.js` change)
- [ ] Skill behaviour changes: scenarios from `tests/scenarios.md` run with a real AI (list which, and on which app)
- [ ] `CHANGELOG.md` updated under `Unreleased`
- [ ] `README.md` and `README.th.md` both updated, if user-facing
