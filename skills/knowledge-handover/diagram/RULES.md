# Diagram rules

How to draw the pictures in a Knowledge Pack: self-contained HTML with inline SVG, editorial style, offline fonts. Read this before drawing; then load only the one type reference you need.

The skin (colours, fonts, the accent question) is in [`references/style-guide.md`](references/style-guide.md). Its "Knowledge-handover skin rules" at the top override everything else.

---

## 1. Philosophy

The highest-quality move is usually deletion.

- Every node is a distinct idea. Two nodes that always travel together are one node.
- Every connection carries information. If layout already shows the relationship, drop the line.
- The accent is editorial, not a flag: 1–2 focal nodes per diagram.
- A diagram is done when nothing can be removed. Target density 4/10. Above 9 nodes, it is probably two diagrams.

## 2. When to draw

In a Knowledge Pack, draw a diagram for every task with steps, without waiting to be asked; skip it only for a straight run of three steps or fewer. Elsewhere, draw when a reader learns more from a picture than from a paragraph, a table or a numbered list. Do not draw lists of things (use a table) or one-shape "diagrams" (write the sentence). On hosts that cannot render HTML, give numbered steps plus a Mermaid block instead.

## 3. Pick the type from the shape of the work

Choose without waiting to be asked. If behaviour matters (queues, enforcement, lifecycle), skim [`references/semantic-patterns.md`](references/semantic-patterns.md) first.

| The work looks like… | Use | Reference |
|---|---|---|
| Steps with yes/no branches | Flowchart | [type-flowchart.md](references/type-flowchart.md) |
| Work handed between people or teams | Swimlane | [type-swimlane.md](references/type-swimlane.md) |
| A judgement made by asking questions in order | Decision tree (Tree) | [type-tree.md](references/type-tree.md) |
| Systems or people messaging each other over time | Sequence | [type-sequence.md](references/type-sequence.md) |
| A document, order or case moving through statuses | State machine | [type-state.md](references/type-state.md) |
| Which systems and tools connect, and where they run | Architecture | [type-architecture.md](references/type-architecture.md) |
| What the customer sees vs what happens behind the scenes | Service blueprint | [type-service-blueprint.md](references/type-service-blueprint.md) |
| What a customer or user does and feels across stages | User journey | [type-journey.md](references/type-journey.md) |
| Recurring calendar, deadlines, events in time | Timeline | [type-timeline.md](references/type-timeline.md) |
| Tasks and phases with durations | Gantt | [type-gantt.md](references/type-gantt.md) |
| Causes of a recurring problem | Fishbone | [type-fishbone.md](references/type-fishbone.md) |

If none fits, use a table or numbered text. RACI and SIPOC are tables, not diagrams. Always load the chosen type reference before drawing.

## 4. Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Dark mode with glow colours | Looks "technical" without design decisions |
| Identical boxes for every node | Erases hierarchy |
| Legend floating inside the diagram | Collides with nodes |
| Arrow labels without a masking rect | Line bleeds through the text |
| Vertical text on arrows | Unreadable |
| Shadows, `rounded-2xl` boxes | Borders, not shadows; radius 6–10px max |
| Accent on every "important" node | Kills the focal signal |
| Copying Mermaid's automatic layout | Imports its spacing and routing instead of an editorial layout |
| Breaking any §6 connector rule | Automatic fail |
| A drawn "screenshot" passed off as real | Never. Use the giver's real images or a diagram |

## 5. Design system

Colours and fonts by semantic role (`paper`, `ink`, `muted`, `soft`, `rule`, `accent`, `accent-tint`, `link`) live in [`references/style-guide.md`](references/style-guide.md). Node treatments (focal, backend/step, store, external, input/person, optional, security) are in the same file under "Node type → treatment".

## 6. Core SVG primitives and connector rules

Markup for background, markers, node boxes, arrow labels and legends: [`references/primitives-core.md`](references/primitives-core.md). Icons: [`references/primitive-icons.md`](references/primitive-icons.md) and [`assets/icons.html`](assets/icons.html). Callouts: [`references/primitive-annotation.md`](references/primitive-annotation.md).

Arrows: `muted` by default, `accent` for the headline path, `link` for API/external calls, dashed `5,4` for optional, return or async. Draw arrows before boxes.

Mandatory connector rules (full text in primitives-core.md):

1. Orthogonal only: rounded right-angle elbows (`r=8`); a straight line only when both ends share x or y.
2. Every arrow label sits on an opaque mask with a 6–10px gap from its stroke.
3. No overlapping connectors: offset parallel routes by 12px or more; hop at a single crossing.
4. Connectors on one box edge each get their own attach point, 12px or more apart.
5. No transit behind a box that is not an endpoint.
6. A label mask must not overlap a node drawn after it.

## 7. Layout and budget

4px grid for geometry. Max 9 nodes, 12 arrows, 2 accent elements, 2 callouts per diagram; per-type limits in [`references/layout-budget.md`](references/layout-budget.md). Over budget → split into overview + detail.

## 8. Checklist before output

- Right type for the shape of the work? Would a table do the same job?
- Can any node, arrow or label be removed or merged?
- Accent on 2 elements or fewer; legend covers exactly what is used.
- `python3 scripts/self_check.py <file>` and `python3 scripts/verify_geometry.py <file>` pass (run them on each diagram file separately; the embedded-font "non-fragment CSS url()" finding is expected).
- `min-width` of the SVG equals its viewBox width, inside an `overflow-x:auto` wrapper.
- If you can render, look at a preview (`python3 scripts/export_png.py <file> <tmp>/preview.png 1`) and fix clipped text, stray connectors and uneven gaps.

## 9. Templates

Start from `assets/template.html` (minimal), `assets/template-full.html` (with cards) or `assets/template-dark.html`. Swap the Google Fonts link for the embedded font CSS. Worked examples for every bundled type: `assets/example-<type>.html`.

## 10. Output

A single self-contained `.html` with inline SVG, embedded CSS and fonts, no network requests. Every `<svg>` carries `role="img"` and `aria-labelledby="<slug>-title <slug>-desc"`, with `<title>` first and a one-sentence `<desc>` about the content. Export to PNG/SVG only when asked ([`references/export.md`](references/export.md)).

Inside a Knowledge Pack, store each diagram's `<svg>…</svg>` string in `knowledge.json` (`processes[].diagram_svg`) when you can write files. On hosts that only give save blocks, leave `diagram_svg` out of the block (a diagram is several thousand characters); START-HERE.html then draws the flow from the steps. Either way, keep a Mermaid version plus a plain-text explanation in the process's `workflow.md`, so the knowledge stays readable without rendering.
