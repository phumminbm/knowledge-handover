# Hosts, saving, building and delivery

## Check what the host can do

At the start, find out (by looking at your tools, not by asking the user) and tell the user once, in plain words:

| Capability | If yes | If no |
|---|---|---|
| Write files | Save `knowledge.json` after each task; build the Pack yourself | Give save blocks; the user keeps them |
| Run code (Node) | `node scripts/build_pack.js …` builds the Pack and zip | The user builds it in the Pack Builder |
| Offer downloads | Offer `knowledge.json` and the zip as downloads | Text save blocks only |
| Tappable choices | Use them for questions | Numbered options + "Other" |
| See images | Read screenshots and photos, help place pins; if you can also save files, store each uploaded image under its step name (`P01-S03.jpg`) yourself | Ask the giver to describe each image |
| Render HTML | Show diagrams and the page preview | Numbered steps + Mermaid |

Three working modes follow from this:
1. **Writes files and runs code** (e.g. Claude with code execution, Codex CLI, Gemini CLI): you keep `knowledge.json` up to date, save uploaded images under their step names, and build the Pack directly.
2. **Creates downloadable files**: you hand over `knowledge.json` and, if you can build it, the zip.
3. **Text-only chat** (many free plans): save blocks plus the Pack Builder.

Never say something is saved unless it is. In a text-only chat, say: "I can't keep this between chats — please keep the save block below."

## Save blocks

- At the end of every session, after each finished task, and before anything long: output the latest **cumulative** block (everything so far, not just today).
- Header line: `KNOWLEDGE-HANDOVER SAVE · <pack_id> · v<version> · <date>`, then the JSON in a fenced `json` block.
- Bump `version` every time and add a `change_log` entry.
- Generate `pack_id` once (`KP-<year>-<4 random digits>`) and keep it forever; it is how a new chat knows which pack it is.
- When a user pastes a block: validate it, say what you found ("Pack KP-2569-0042, v4: 3 of 8 tasks captured, next is P04"), and continue. If two blocks disagree, ask which is newer (higher version wins by default).
- If a block becomes too long for the host, split it: one block for the core (role, tasks, handover) and one per task, each with the same `pack_id` and version. The Pack Builder accepts several blocks pasted together.

## Building

**With Node available:**

```bash
node scripts/build_pack.js knowledge.json --images ./images --out ./out
```

This writes `./out/<pack_id>/` and `./out/knowledge-handover_<pack_id>_<date>.zip`. Add `--no-zip` to skip the zip. It accepts a raw `knowledge.json` or a pasted save block file. Check the console for warnings (missing images, broken branch targets, unconfirmed safety steps) and fix what you can.

**Without Node:** send the user to the Pack Builder — the file `pack-builder.html` in the skill's release, or its web link. They paste the latest save block (or several), drop in the image folder, choose the accent colour if not set, and click Build to download the zip. Everything runs in their browser; nothing is uploaded.

If you can write files but not run Node, write `knowledge.json` and tell the user to open it in the Pack Builder.

## Delivering the Pack

Give the giver:
1. **The zip**, named `knowledge-handover_<pack_id>_<date>.zip`.
2. **The handover message** (`handover_message` in the JSON, also written to `handover-message.txt`), in the giver's language. Keep it short, e.g.:

   > I've put together a handover pack for [work]. The easiest way to start: attach this zip to any AI chat (if the chat won't take a zip, attach **PACK-FOR-AI.md**) and say "teach me from this pack". The AI will explain the work and what's urgent first, then give you **START-HERE.html** and walk you through it. No AI? Just open START-HERE.html in your browser; urgent items are at the top.

   Lead with the AI route because a receiver who is told what they're looking at first is less likely to get lost; keep the browser route as the fallback.

3. **Advice, in one or two lines:** share it as a link from the organisation's approved shared drive rather than an email attachment (size limits, access control), and send a copy to the manager or process owner so the knowledge isn't lost if no successor exists yet. Local-only copies can be lost when a device is replaced.

`START-HERE.html` and `PACK-FOR-AI.md` each work on their own, so a receiver on a phone can open just one file.
