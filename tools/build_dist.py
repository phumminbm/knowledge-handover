#!/usr/bin/env python3
"""Build release artefacts for knowledge-handover.

Outputs:
  skills/knowledge-handover/assets/pack-builder.html  (shipped inside the skill; committed, CI checks it is current)
  dist/pack-builder.html                               (release download)
  dist/PROMPT.md                                       (single file for AI chats without skills)
  dist/knowledge-handover.zip                          (skill folder, for uploading to Claude / ChatGPT)
  site/index.html                                      (GitHub Pages: the Pack Builder)

dist/ and site/ are build output and are not committed. The zip is reproducible:
the same sources always give the same bytes.

Usage: python3 tools/build_dist.py [--pages-url URL]
"""
import argparse
import os
import json
import pathlib
import re
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL = ROOT / "skills" / "knowledge-handover"
DIST = ROOT / "dist"
SITE = ROOT / "site"


def read(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def build_pack_builder():
    tpl = read(SKILL / "assets" / "pack-builder.template.html")
    # documents.js defines KHDocs, which pack-core.js picks up in the browser; it must come first.
    core = read(SKILL / "scripts" / "documents.js") + "\n" + read(SKILL / "scripts" / "pack-core.js")
    start = read(SKILL / "assets" / "start-here.template.html")
    fonts = read(SKILL / "assets" / "fonts" / "poppins-prompt.css")
    if "</script" in core.lower():
        raise SystemExit("documents.js and pack-core.js must not contain a closing script tag")
    start_js = json.dumps(start).replace("</", "<\\/")
    out = (tpl.replace("/*__FONTS__*/", fonts, 1)
              .replace("/*__CORE__*/", core, 1)
              .replace('/*__TEMPLATE__*/""', start_js, 1))
    for target in (SKILL / "assets" / "pack-builder.html", DIST / "pack-builder.html", SITE / "index.html"):
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(out, encoding="utf-8")
    return out


def strip_frontmatter(text):
    return re.sub(r"\A---\n.*?\n---\n", "", text, count=1, flags=re.S)


def build_prompt(pages_url):
    parts = [
        "# knowledge-handover — portable prompt",
        "",
        "Paste this whole file at the start of a chat (or into a Gem / Project / custom instructions) "
        "when your AI has no skill support. Then say what you want, e.g. \"help me write down how I do my job\" "
        "or paste a save block to continue.",
        "",
        "> **Note for the AI:** in this mode you cannot open bundled files or run scripts. Everything you "
        "need is in this document. Diagrams: draw them only if this chat can render them; otherwise use "
        "numbered steps plus a short Mermaid block. To build the final Pack, give the user the latest save "
        f"block and send them to the Pack Builder: {pages_url} (it runs in their browser; nothing is uploaded).",
        "",
        "---",
        "",
        strip_frontmatter(read(SKILL / "SKILL.md")),
    ]
    for name in ["discovery", "interview", "images-and-safety", "pack-format", "saving-and-hosts", "teaching"]:
        body = read(SKILL / "references" / f"{name}.md")
        body = re.sub(r"^# ", "## Reference: ", body, count=1, flags=re.M)
        parts += ["", "---", "", body]
    text = "\n".join(parts)
    text = text.replace("`diagram/RULES.md`", "the diagram note at the top")
    DIST.mkdir(exist_ok=True)
    (DIST / "PROMPT.md").write_text(text, encoding="utf-8")
    return text


def build_zip():
    DIST.mkdir(exist_ok=True)
    target = DIST / "knowledge-handover.zip"
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(SKILL.rglob("*")):
            if p.is_file() and "__pycache__" not in p.parts and p.suffix != ".pyc":
                info = zipfile.ZipInfo(str(pathlib.PurePosixPath("knowledge-handover") / p.relative_to(SKILL).as_posix()),
                                       date_time=(1980, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o755 if os.access(p, os.X_OK) else 0o644) << 16
                z.writestr(info, p.read_bytes())
    return target


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages-url", default="https://<your-github-user>.github.io/knowledge-handover/")
    a = ap.parse_args()
    pb = build_pack_builder()
    pr = build_prompt(a.pages_url)
    z = build_zip()
    print(f"pack-builder.html  {len(pb)//1024} KB")
    print(f"PROMPT.md          {len(pr)//1024} KB")
    print(f"{z.name}  {z.stat().st_size//1024} KB")
