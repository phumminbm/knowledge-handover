<div align="center">

<img src=".claude-plugin/icon.png" width="88" alt="">

# knowledge-handover

**People leave. Knowledge shouldn't.**

An AI skill that interviews someone about how they really do their job, then turns it into one **Knowledge Pack** that the next person can open in a browser or hand to any AI to be taught step by step.

**English** · [ภาษาไทย](README.th.md)

[![CI](https://img.shields.io/github/actions/workflow/status/phumminbm/knowledge-handover/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/phumminbm/knowledge-handover/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/phumminbm/knowledge-handover?style=flat-square&color=bf4520)](https://github.com/phumminbm/knowledge-handover/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-555555?style=flat-square)](LICENSE)

[Install](#install) · [How it works](#how-it-works) · [See an example](https://phumminbm.github.io/knowledge-handover/example/START-HERE.html) · [Pack Builder](https://phumminbm.github.io/knowledge-handover/) · [Help](#if-something-goes-wrong)

<img src="docs/images/walkthrough.jpg" alt="A step in START-HERE.html: the giver's real screenshot with numbered pins, why the step exists, and how to check it was done right" width="860">

</div>

## Why

When someone leaves, the handover document is usually written in a rush, misses the exceptions, and nobody knows which parts are still true. knowledge-handover lets the AI do the asking:

- **Easy for the giver:** start with one sentence, answer mostly by tapping, stop and continue any time.
- **Easy for the receiver:** nothing to install. Open `START-HERE.html`, or attach the Pack to any AI chat and say *"teach me from this pack"*.
- **Any job:** office work, on-site work, care work. Screenshots or on-site photos.
- **Any AI:** Claude, ChatGPT, Codex, Gemini, Cursor, Copilot, and plain chats on free plans.
- **Honest:** every item is marked **Confirmed**, **Not yet reviewed**, **Needs confirmation** or **Open question**, so nobody mistakes a guess for a rule.
- **Your data stays with you:** no server, no account, no tracking. See [PRIVACY.md](PRIVACY.md).

<table>
<tr>
<td width="62%"><img src="docs/images/start-here.jpg" alt="START-HERE.html home: where to start, urgent items with due dates, and the tasks of the role"></td>
<td width="38%"><img src="docs/images/phone.jpg" alt="The same walkthrough on a phone"></td>
</tr>
<tr>
<td>Urgent items first, then every task of the role</td>
<td>Works on a phone, offline</td>
</tr>
</table>

## Install

### Claude (claude.ai and the desktop app, all plans including Free)

1. Download **[knowledge-handover.zip](https://github.com/phumminbm/knowledge-handover/releases/latest/download/knowledge-handover.zip)**.
2. In Claude, open **Customize › Skills** and upload the zip.
3. Make sure **Code execution** is on, so Claude can build the Pack for you.

### ChatGPT (workspaces with Skills)

Download the same **[knowledge-handover.zip](https://github.com/phumminbm/knowledge-handover/releases/latest/download/knowledge-handover.zip)**, then **Skills › Create › Upload from your computer**.

### Any other AI chat (Gemini, free ChatGPT, Copilot chat, …)

Download **[PROMPT.md](https://github.com/phumminbm/knowledge-handover/releases/latest/download/PROMPT.md)** and paste it at the start of the chat, or put it in a Gem, Project or custom instructions. The AI gives you save blocks, and you build the Pack in the [Pack Builder](https://phumminbm.github.io/knowledge-handover/).

<details>
<summary><b>Claude Code</b></summary>

```text
/plugin marketplace add phumminbm/knowledge-handover
/plugin install knowledge-handover@knowledge-handover
```

On Claude Code 2.1.275 or later this also works in one step:

```text
/plugin install knowledge-handover --marketplace phumminbm/knowledge-handover
```

To get updates automatically: run `/plugin`, open **Marketplaces**, select **knowledge-handover**, choose **Enable auto-update**.

</details>

<details>
<summary><b>Cursor, GitHub Copilot, Gemini CLI, Windsurf, Cline</b> and other Agent Skills hosts</summary>

```bash
npx skills add phumminbm/knowledge-handover
```

Update later with `npx skills update knowledge-handover`.

</details>

<details>
<summary><b>Codex</b></summary>

```bash
codex plugin marketplace add phumminbm/knowledge-handover
codex plugin add knowledge-handover@knowledge-handover
```

</details>

<details>
<summary><b>Gemini CLI</b> (native)</summary>

```bash
gemini skills install https://github.com/phumminbm/knowledge-handover --path skills/knowledge-handover
```

</details>

<details>
<summary><b>Manual</b></summary>

Copy `skills/knowledge-handover/` into your host's skills folder, for example `~/.claude/skills/knowledge-handover/`.

</details>

## How it works

### 1. The giver talks

Say something like this, in any language:

> *"I'm leaving next month, help me hand over my work."*
>
> *"อีก 2 อาทิตย์จะลาออก ช่วยเก็บงานส่งต่อให้หน่อย"*
>
> *"Write down how I do the month-end close, I have screenshots."*

The AI gets to know the work, asks about what you'd forget to write down (exceptions, deadlines, who to call), draws what it understood for you to check, and ends every session with a **save block**. Keep the save block, and paste it into a new chat to continue.

### 2. The Pack gets built

- If the AI can run code (Claude with code execution, Claude Code, Codex, Gemini CLI), it builds the zip for you.
- If not, open the **[Pack Builder](https://phumminbm.github.io/knowledge-handover/)**, paste the latest save block, drop in your images, and download the zip. It runs entirely in your browser; nothing is uploaded.

<img src="docs/images/pack-builder.jpg" alt="The Pack Builder: paste the save block, add images, build" width="720">

### 3. The receiver learns

Attach the zip (or just `PACK-FOR-AI.md`) to any AI chat and say *"teach me from this pack"*. The AI explains the work and what is urgent first, then walks through each task with the real images and explains why each step exists. Without an AI, open `START-HERE.html` in a browser. **[Open the example Pack](https://phumminbm.github.io/knowledge-handover/example/START-HERE.html)** to see what a receiver gets.

## What's in a Pack

```text
knowledge-handover_KP-2569-0042_2026-11-30.zip
├── START-HERE.html      urgent items, work map, step-by-step walkthroughs with real images, quizzes
├── PACK-FOR-AI.md       everything in one file, with teaching instructions for any AI
├── handover-status.md   work in progress, deadlines, people waiting, accounts to transfer
├── processes/…          one folder per task: workflow, procedures, decisions, troubleshooting, scenarios
├── visuals/             original images, untouched
├── open-questions.md    what is still unanswered, and whom to ask
└── knowledge.json       the source of everything; paste it back into a chat to update the Pack
```

## Privacy and safety

- The skill never records passwords, keys or one-time codes, and tells you to change any secret you paste.
- It points to the official record (CRM, patient system, register) instead of copying people's contact details, health information, salaries or prices, and asks you to cover personal data in images.
- It never fabricates screenshots and never marks an AI guess as confirmed.
- `START-HERE.html` and the Pack Builder make no network requests, and treat Pack content as untrusted, so a tampered Pack cannot run code.

A Pack contains whatever the giver shared, so store and send it only where your organisation allows. Details: [PRIVACY.md](PRIVACY.md) · Report a problem privately: [SECURITY.md](SECURITY.md).

## If something goes wrong

| What you see | What to do |
|---|---|
| The AI says it can't build the zip | It can't run code here. Use the [Pack Builder](https://phumminbm.github.io/knowledge-handover/) with your latest save block. On claude.ai, turning on Code execution lets Claude build it. |
| A new chat doesn't remember the handover | Chats don't keep memory. Paste your latest save block and the AI continues from there. |
| The save block is too long for the chat | Ask the AI to split it. Paste all the blocks into the Pack Builder at once; it joins them. |
| Images are missing from the Pack | Name each picture as the AI told you (e.g. `P01-S03.jpg`) and drop them into the Pack Builder. |
| The receiver's chat won't accept a zip | Attach `PACK-FOR-AI.md` from inside the zip instead. |
| claude.ai says the zip has too many files | You uploaded the GitHub "Download ZIP" of the whole repository. Use `knowledge-handover.zip` from [Releases](https://github.com/phumminbm/knowledge-handover/releases/latest). |

Still stuck? [Open an issue](https://github.com/phumminbm/knowledge-handover/issues/new/choose), in English or Thai.

## For developers

```text
skills/knowledge-handover/
├── SKILL.md            goal, scope and the lines the AI must not cross
├── references/         discovery, interview, images & safety, pack format, saving & hosts, teaching
├── scripts/            pack-core.js (shared builder), build_pack.js (Node CLI)
├── assets/             START-HERE template, Pack Builder, embedded fonts
└── diagram/            bundled diagram engine (11 diagram types) and its licenses
.claude-plugin/ .codex-plugin/ .agents/   plugin manifests for each host, all pointing at skills/
tools/build_dist.py     builds the Pack Builder, PROMPT.md and the skill zip
examples/               a fictional example Pack
tests/                  unit tests, browser security tests, and AI test scenarios
```

```bash
npm install && npx playwright install chromium
npm test                  # unit tests
python3 tools/build_dist.py
npm run test:e2e          # browser tests
npm run example           # builds the example Pack into build/example
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and, for coding agents, [AGENTS.md](AGENTS.md). Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## License

MIT (see [LICENSE](LICENSE)). Bundled components keep their own licenses: the diagram engine is adapted from [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) (see [`diagram/THIRD_PARTY_LICENSES.md`](skills/knowledge-handover/diagram/THIRD_PARTY_LICENSES.md)), and the Poppins and Prompt fonts are under the [SIL Open Font License](skills/knowledge-handover/assets/fonts/OFL.txt).
