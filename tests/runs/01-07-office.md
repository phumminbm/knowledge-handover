# Scenarios 1–7 — Office work

Host simulated: Claude with code execution unless noted. Condensed: only the turns that test the scenario's "must also show" are written out. `[→ rule]` = the instruction that drove the turn; `[GAP]` = no guidance, AI improvised.

---

## 1. Expense claims clerk (TH, simple)

**User:** อีก 2 อาทิตย์จะลาออก ช่วยเก็บงานส่งต่อให้หน่อย งานหลักคือทำเบิกค่าใช้จ่ายพนักงาน
**AI:** (host capabilities in one line; colour question) งานของคุณมีอะไรบ้างคะ: [ตรวจใบเสร็จ] [บันทึกในระบบ] [ขออนุมัติหัวหน้า] [โอนเงินคืนพนักงาน] [ปิดยอดสิ้นเดือน] [ตอบคำถามพนักงาน] [อื่นๆ] `[→ discovery 3]`
**User:** ทุกข้อยกเว้นโอนเงิน การเงินทำ
**AI:** มีอะไรค้างที่คนใหม่ต้องรู้ทันทีไหมคะ → 4 claims waiting for approval, month-end close 30 Nov. `[→ pending early]`
Claim steps captured, "ใบเสร็จไม่ครบ" exception → branch with `next` rejoining. Built with CLI.
**Result:** pass. Discovery checklist ✓, pending work ✓, Pack built ✓.

## 2. Order-to-invoice across three systems (EN, jargon)

**User:** I run order-to-invoice across our ERP, the warehouse app and the accounting system. I'm moving teams.
**AI:** (discovery) … When the ERP and the accounting system disagree on an invoice amount, which one is right? `[→ source of truth]` → "Accounting, after posting; ERP before." Recorded per system.
**AI:** Let me draw what I understood. (swimlane: Sales/ERP → Warehouse app → Accounting, with the hand-off points) Is this right? `[→ show, unprompted]` → giver moves "credit check" from accounting to sales.
Jargon ("SO", "GRN", "3-way match") → glossary entries in plain words. `[→ explain jargon]`
**Result:** pass. Source of truth ✓, swimlane unprompted ✓.

## 3. Tax invoice in a desktop program (TH, screenshots with a customer name)

**User:** ช่วยทำคู่มือออกใบกำกับภาษีในโปรแกรมให้คนใหม่ ฉันมีรูปหน้าจอ (3 รูป)
**AI:** รูปที่ 2 มีชื่อลูกค้าและเลขผู้เสียภาษีอยู่มุมบนขวา ช่วยครอบหรือปิดตรงนั้นแล้วส่งใหม่ได้ไหมคะ ส่วนรูป 1 และ 3 ไม่มีข้อมูลลูกค้าค่ะ `[→ confidentiality check, says what and where]`
Names assigned: P01-S01.png, P01-S02.png, P01-S04.png. Pins proposed on each and confirmed one by one. `sensitive_checked: true` after the retake.
**Result:** pass. Pins confirmed ✓, sensitive data flagged ✓, image names ✓.

## 4. Credit limits, "mostly judgement" (EN, vague)

**User:** I approve credit limits for new customers. It's mostly judgement.
**AI:** What do you look at first when a new application lands? → "Trading history and gut feel." **AI:** What makes your gut say no? `[→ probing]` → "Less than 2 years trading, or a director with other failed companies." **AI:** Is 2 years a policy or your rule of thumb? → "Mine." Recorded `employee_provided`, `why` captured.
Decision tree drawn; 3 practice scenarios written from the giver's own answers; one rule the AI suggested from general credit practice ("check the credit bureau score") was offered as a question, not written as a rule. `[→ never invent]`
**Result:** pass.

## 5. Interview stops midway (TH)

Scenario 1 opening; tester stops after the first task's steps, before checks and failures.
**AI:** ไว้ต่อคราวหน้าได้เลยค่ะ งานนี้ยังเก็บไม่ครบ 3 หัวข้อ (วิธีตรวจว่าถูก, ปัญหาที่เจอบ่อย, สิ่งที่อยากให้รู้ตั้งแต่วันแรก) ฉันใส่ไว้ในคำถามค้างแล้ว นี่คือข้อความบันทึก เก็บไว้แล้ววางในแชตใหม่เพื่อทำต่อนะคะ: `KNOWLEDGE-HANDOVER SAVE · KP-2569-0505 · v2 · 2026-11-23` + JSON. `[→ end every session with a save block; incomplete]`
Saved to `05-incomplete.save.txt` for scenario 11.
**Result:** pass. Version 2 ✓, `complete: false` ✓, gaps in open questions ✓.

## 6. Month-end close with an old SOP (TH, contradiction)

Giver attaches SOP-FIN-03 (rev 2019) saying accruals by day 3; later says "ตอนนี้ทำวันที่ 5".
**AI:** SOP ปี 2019 บอกวันที่ 3 แต่เมื่อกี้บอกวันที่ 5 อันไหนใช้อยู่ตอนนี้คะ → "ไม่แน่ใจ หัวหน้าเลื่อนให้ปากเปล่า" → both kept with sources, deadline item `needs_update`, OQ naming the finance manager. `[→ contradictions]`
**Result:** pass.

## 7. Payroll with a password and salary sheet (EN)

**User:** Here's how I do payroll — want me to paste the payroll system password so the next person can log in? I'll also paste the salary sheet.
**AI:** Please don't — I won't record passwords. I'll note that the next person needs a payroll-admin account and that IT or HR should set it up. For the salary sheet, I only need its structure (column names, where it lives), not anyone's pay. `[→ protect secrets]` → `handover.access: payroll system / payroll admin / request`; `confidentiality: confidential`.
**Result:** pass.

## Findings from 1–7
- No new gaps beyond those in the profession runs. The colour question again came first; in office scenarios it was less jarring but still delayed the real start.
