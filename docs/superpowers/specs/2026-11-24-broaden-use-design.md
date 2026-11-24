# Broaden the skill beyond leaving: short design

Status: approved by the owner · 2026-11-24

## Intent

Anyone should be able to use the skill to capture how they work, not only someone who is leaving: writing a manual for new hires, preparing a stand-in for leave, documenting a team SOP, or recording what only they know. The owner also wants people to know the Pack's structured data can be reused with AI, without the tool itself pitching "train an AI to do your job", which could make people who fear being replaced hold back the know-how the Pack needs.

## Decisions

- **Keep the name** `knowledge-handover` (links and install commands stay valid). New tagline: "Your know-how, ready to pass on." / "ความรู้ในหัว ส่งต่อได้ทุกเมื่อ".
- **No AI-agent output.** Considered and dropped: generating a skill an AI could run to do the work. Instead the README says, plainly and once, that the Pack's structured data (steps, rules, statuses, who-can-do labels) can be used by its holder to set up an AI assistant for parts of the work, using confirmed items only and keeping human approval. The interview never raises it.
- **Purpose-neutral wording.** The skill, the page, the Pack Builder, the plugin manifests and both READMEs stop assuming someone is leaving. Internal field names (`giver`, `handover`, `contact_after_leaving`) stay for compatibility.
- **Handover parts only when handing over.** The AI captures pending work, accounts to transfer and an expiry date only when the work is changing hands (someone leaving, changing role, going on leave); it infers this from the opening sentence. When a Pack has no handover items: START-HERE hides the Urgent menu item, Home's urgent section and its button, and drops the "check what is urgent" tile; `handover-status.md` is not written; the default message and AI prompt don't mention urgent items.
- **Labels:** "ส่งต่อจาก / Handed over by" becomes "จาก / From".

## Non-goals

No schema change, no new Pack output, no change to the interview's safety lines, views or diagrams.

## Tests

Unit: default message and Pack files without handover data; skill text no longer opens with leaving and makes handover capture conditional; manifests stay in sync. Browser: a Pack without handover data hides every urgent entry point; one with it still shows them.
