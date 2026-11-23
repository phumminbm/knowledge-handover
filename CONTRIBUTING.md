# Contributing

Thanks for helping. Issues and pull requests are welcome in English or Thai.

## Good first contributions

- **Try it on a real handover** and open an issue with what confused the giver or the receiver. This is the most useful feedback right now; see "Still to do with real people" in [`tests/runs/RESULTS.md`](tests/runs/RESULTS.md).
- **Translate the UI labels** of `START-HERE.html` and the Pack Builder into another language.
- **Add a test scenario** for a job that is not covered yet in [`tests/scenarios.md`](tests/scenarios.md).

## Set up

You need Node.js 20+ and Python 3.10+.

```bash
git clone https://github.com/phumminbm/knowledge-handover.git
cd knowledge-handover
npm install
npx playwright install chromium
```

## Make a change

1. Branch from `main`.
2. Edit the source files listed in [AGENTS.md](AGENTS.md), not the generated ones.
3. Run the checks:

   ```bash
   npm test                       # unit tests for the pack builder and manifests
   python3 tools/build_dist.py    # rebuilds the Pack Builder, PROMPT.md and the skill zip
   npm run test:e2e               # browser tests: page behaviour, task views, and hostile packs must not run code
   ```

4. If you changed the skill's behaviour, run the relevant scenarios in `tests/scenarios.md` with a real AI and note the result in the pull request.
5. Add a line under `## [Unreleased]` in `CHANGELOG.md`.
6. Open a pull request and fill in the template.

## Changing the skill text

`SKILL.md` and `references/` are instructions for an AI. Keep them short, explain *why* a rule exists, and prefer judgement over scripts. Every change should keep the hard lines in `SKILL.md` intact. If you change what goes into `knowledge.json`, update `references/pack-format.md`, the builder, and the example pack in the same pull request.

## Releasing (maintainers)

1. Move the `Unreleased` notes in `CHANGELOG.md` under a new version heading.
2. Set the same version in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` and `package.json`.
3. Merge to `main`, then tag: `git tag v0.2.0 && git push origin v0.2.0`.

The Release workflow checks that the tag matches the version, builds the files and publishes the GitHub Release. GitHub Pages (the Pack Builder and the example Pack) is updated from `main` on every merge.

## Code of conduct

Be kind and assume good intent. Harassment or personal attacks are not accepted in issues, pull requests or discussions; maintainers may remove such content and block the people who post it.
