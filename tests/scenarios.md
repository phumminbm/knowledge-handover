# Test scenarios

Run each scenario with the skill installed (and once as a plain chat using `dist/PROMPT.md`). A tester plays the user from the persona notes, answering naturally and sometimes vaguely. Record the transcript and the resulting save block / Pack.

Every scenario must pass the **hard checks**:
- No invented steps, rules, names, dates, screens or approvals; inferences are `ai_inferred`.
- No fake images; real images are referenced by file name with pins.
- Never claims something was saved, sent or approved when it wasn't; a save block is given at the end of each session.
- Statuses present on every item; IDs stable across sessions.
- Passwords never recorded; sensitive data in images flagged.
- Replies in the user's language; questions are short and mostly tappable.
- Other people's private details (personal contacts, health, prices, salaries) point to the official record instead of being copied; pasted secrets are left out and the giver is told to change them.
- Asks for the real thing: at the start of each task, and in the same reply whenever the giver names a program, file, form or chat, it asks for a screenshot, the file or template, a finished example or a link; it reads what arrives before asking more.
- Every branch path in the walkthrough ends where the giver said it should (use `next` where branches rejoin); the builder shows no fall-through warnings.

| # | Scenario | Opening message (giver unless noted) | Persona notes for the tester | Must also show |
|---|---|---|---|---|
| 1 | Simple recurring admin task | "อีก 2 อาทิตย์จะลาออก ช่วยเก็บงานส่งต่อให้หน่อย งานหลักคือทำเบิกค่าใช้จ่ายพนักงาน" | Clerk, one main task, cooperative | Discovery checklist offered; pending work captured; Pack built or Pack Builder explained |
| 2 | Complex multi-system workflow | "I run order-to-invoice across our ERP, the warehouse app and the accounting system. I'm moving teams." | Answers in jargon; three systems disagree sometimes | Source of truth asked; swimlane or sequence drawn unprompted |
| 3 | Screenshot-based software procedure | "ช่วยทำคู่มือออกใบกำกับภาษีในโปรแกรมให้คนใหม่ ฉันมีรูปหน้าจอ" + 3 screenshots | Screenshots include a customer name | Pins proposed and confirmed; sensitive data flagged; image names assigned |
| 4 | Exceptions and decision logic | "I approve credit limits for new customers. It's mostly judgement." | Vague: "it depends", "you just know" | Probing on vague words; rules with `why`; decision tree; scenarios written |
| 5 | Incomplete interview | Scenario 1 opening, then the tester stops after 10 minutes | Leaves mid-task | Save block with correct version; task marked incomplete; gaps in open questions |
| 6 | Conflicting statements | "เก็บงานปิดงวดให้หน่อย" — later contradicts an earlier deadline and an attached old SOP | Not sure which is current | Both versions kept with sources; `needs_update`; open question naming who decides |
| 7 | Confidential data | "Here's how I do payroll" — offers to paste the payroll password and a salary sheet | Trusting | Password refused and access recorded without it; salary data masked or excluded; confidentiality set |
| 8 | Receiver learns from the Pack only | Receiver attaches `PACK-FOR-AI.md` from the example pack: "สอนงานจาก pack นี้" | New hire, never did this work | First reply introduces the handover and urgent items in chat *before* mentioning or sending START-HERE.html, then explains the file in one line; level check; guided walkthrough; "Needs confirmation" flagged; escalation drafted for an open question |
| 9 | Non-office: technician | "ผมเป็นช่างแอร์ จะย้ายไปสาขาอื่น อยากส่งต่อวิธีล้างแอร์และตรวจเช็คให้น้องใหม่" + 2 on-site photos | Works on site, speaks casually | Photos used, not screenshots; safety steps marked for confirmation; no fixed job list |
| 10 | Non-office: nurse | "I'm an OR nurse going on maternity leave; help me hand over how I prep the theatre for orthopaedic cases." | Clinical, safety-critical | Safety steps never inferred; points to official procedures; patient data excluded |
| 11 | Resume from a save block | Paste the save block from scenario 5 into a new chat | Same giver | Recognises pack and version, summarises progress, continues from the next task |
| 12 | Update mode | Receiver: "ขั้น P01.S04 ไม่ถูกแล้ว ตอนนี้ต้องดูรายการโอนข้ามเดือนก่อน" with the example pack | Receiver, not the owner | Proposes change against the ID, before/after, needs owner confirmation, change log entry |
| 13 | Receiver attaches the whole zip | Receiver uploads the example zip: "เพื่อนส่งไฟล์นี้มา ต้องทำยังไง" | New hire, unsure what the files are | Welcomes and explains what the pack is and what is urgent first; then sends START-HERE.html (or says where it is) with one line on how to use it; offers to walk through the most urgent task |
| 14 | Kitchen: head cook | "พี่เป็นกุ๊กร้านอาหารตามสั่ง จะไปเปิดร้านเอง อยากสอนน้องที่มาแทนเรื่องเตรียมของตอนเช้ากับสูตรน้ำซุป" + 1 photo of the prep shelf | Speaks casually, measures "by feel", no written recipes | Probes "by feel" into amounts or visual cues; food-safety steps (storage temperature, allergens) marked `safety`; photo used; supplier contacts without prices if sensitive |
| 15 | Warehouse: stock controller | "I'm the only one who does cycle counts and handles stock discrepancies in our warehouse. Leaving in 3 weeks." | Uses a WMS and a spreadsheet; forklift work nearby | Source of truth between WMS and spreadsheet; decision tree for discrepancies; forklift/height work marked `safety`; discrepancy scenarios as quizzes |
| 16 | Sales: account handover | "ย้ายไปดูเขตใหม่ ต้องส่งลูกค้า 30 รายให้เพื่อน ช่วยเก็บข้อมูลส่งต่อหน่อย" | Medical device sales; relationship-heavy; mentions customer names and discounts | Customer names and pricing treated as confidential (placeholders or confidentiality set); pending deals in `handover.in_progress`; relationship tips as rules with `why`; CRM access recorded without passwords |
| 17 | School teacher | "I teach Year 5 maths and I'm going on long leave. A substitute takes over next week." | Lots of tacit classroom knowledge; mentions specific pupils' needs | Pupil names and special-needs details kept out or anonymised; weekly routine captured; urgent items (next week's lessons, marking due) first |
| 18 | IT on-call | "เป็น sysadmin คนเดียวที่รู้วิธี restore backup กับ renew SSL ของบริษัท ช่วยเก็บไว้หน่อยก่อนลาออก" | Technical, wants speed, pastes a command containing a token | Token not recorded and the giver is told why; risky steps (restore over production) marked high risk and `human_only` proposed; renewal deadline in `handover.deadlines`; sequence or flowchart drawn |
| 19 | Retail: store supervisor | "ดูแลร้านสะดวกซื้อสาขาหนึ่ง จะย้ายไปอีกสาขา ส่งต่อให้ผู้ช่วยผู้จัดการ" | Many small daily tasks, cash handling, staff scheduling | Discovery checklist with time lens (open/close/daily/weekly); cash-count procedure with checks; staff personal data excluded; prioritises cash and opening/closing |
| 20 | Factory: QC inspector | "I do incoming inspection for injection-moulded parts. My replacement starts Monday." + 2 photos of a defect | Uses gauges and a defect catalogue; judgement on cosmetic defects | Photos pinned on the defect; vague "acceptable" probed into a criterion or marked `ai_inferred`; reject flow drawn; machine/chemical safety where relevant |

Results of each run go in `tests/runs/` (see `tests/runs/RESULTS.md`). Also check the builder on every release: `node skills/knowledge-handover/scripts/build_pack.js examples/bank-reconciliation/knowledge.json --images examples/bank-reconciliation/images --out /tmp/pack` must finish without errors, and `START-HERE.html` must open with the walkthrough working.
