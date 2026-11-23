# knowledge-handover

**People leave. Knowledge shouldn't.**

An AI skill that interviews someone about how they really do their job and turns it into a **Knowledge Pack**: one zip that the next person can open in a browser, or hand to any AI to be taught step by step with the original person's real screenshots and photos.

- **Easy for the giver:** start with one sentence, answer mostly by tapping, stop and resume any time.
- **Easy for the receiver:** nothing to install. Attach the zip (or `PACK-FOR-AI.md`) to any AI chat: the AI introduces the work and what is urgent first, then hands over `START-HERE.html`. Without an AI, just open `START-HERE.html`.
- **Works for any job:** office work, on-site work, care work. Screenshots or on-site photos.
- **Works with any AI:** Claude, ChatGPT, Codex, Gemini, and plain chats on free plans.
- **Your data stays with you:** no server, no account. Packs are files you store where your organisation allows.

## What the giver gets

```text
knowledge-handover_KP-2569-0042_2026-11-30.zip
├── START-HERE.html      urgent items, work map, step-by-step walkthroughs with real images, quizzes
├── PACK-FOR-AI.md       everything in one file, with teaching instructions for any AI
├── handover-status.md   work in progress, deadlines, people waiting, accounts to transfer
├── processes/…          one folder per task: workflow, procedures, decisions, troubleshooting, scenarios
├── visuals/             original images, untouched
├── open-questions.md    what is still unanswered, and whom to ask
└── knowledge.json       the source of everything; paste it back into a chat to update the pack
```

Every item is marked **Confirmed**, **Not yet reviewed**, **Needs confirmation** or **Open question**, so nobody mistakes a guess for a rule.

## Install

| Where | How |
|---|---|
| **Claude** (claude.ai, all plans incl. Free) | Download `knowledge-handover.zip` from [Releases](../../releases), then Customize › Skills › upload. Code execution must be on. |
| **Claude Code** | `npx skills add phumminbm/knowledge-handover -a claude-code`, or copy `skills/knowledge-handover` to `~/.claude/skills/` |
| **ChatGPT** (workspaces with Skills) | Skills › Create › Upload from your computer › `knowledge-handover.zip` |
| **Codex CLI** | `npx skills add phumminbm/knowledge-handover -a codex` |
| **Gemini CLI** | `gemini skills install https://github.com/phumminbm/knowledge-handover --path skills/knowledge-handover` |
| **Any other AI chat** | Paste [`PROMPT.md`](../../releases) at the start of the chat, or put it in a Gem / Project / custom instructions |

## Use

**Giver:** say something like *"I'm leaving next month, help me hand over my work"* (in any language). The AI gets to know your work, asks what you'd forget to write down, draws what it understood for you to check, and gives you a **save block** at the end of every session. Keep the save block; paste it into a new chat to continue.

**Building the pack:**
- If the AI can run code, it builds the zip for you.
- If not, open the **[Pack Builder](https://phumminbm.github.io/knowledge-handover/)** (or `pack-builder.html` from Releases), paste the latest save block, drop in your images, and download the zip. It runs entirely in your browser; nothing is uploaded.

**Receiver:** attach the zip (or `PACK-FOR-AI.md` if the chat won't take a zip) to any AI chat and say *"teach me from this pack"*. The AI explains the handover and the urgent items first, then gives you `START-HERE.html` and walks you through it. Without an AI, open `START-HERE.html` in a browser.

## Repository layout

```text
skills/knowledge-handover/
├── SKILL.md                 goal, scope and the lines the AI must not cross
├── references/              discovery, interview, images & safety, pack format, saving & hosts, teaching
├── scripts/                 pack-core.js (shared builder), build_pack.js (Node CLI)
├── assets/                  START-HERE template, Pack Builder, embedded fonts
└── diagram/                 bundled diagram engine (11 diagram types) and its licenses
tools/build_dist.py          builds dist/pack-builder.html, dist/PROMPT.md, dist/knowledge-handover.zip
examples/                    a fictional example pack
tests/scenarios/             test prompts used before each release
```

Build release files locally:

```bash
python3 tools/build_dist.py --pages-url https://phumminbm.github.io/knowledge-handover/
node skills/knowledge-handover/scripts/build_pack.js examples/bank-reconciliation/knowledge.json \
  --images examples/bank-reconciliation/images --out /tmp/pack
```

## Privacy and safety

The skill never records passwords, asks givers to cover customer and personal data in images, never fabricates screenshots, and never marks AI guesses as confirmed. Packs contain whatever the giver shares, so treat them as internal documents.

## License

MIT for this project (see [LICENSE](LICENSE)). Bundled components keep their own licenses: see `skills/knowledge-handover/diagram/LICENSE`, `skills/knowledge-handover/diagram/THIRD_PARTY_LICENSES.md` and `skills/knowledge-handover/assets/fonts/OFL.txt`.
