# Scenario 9 — Air-con technician (TH, on-site photos)

Host simulated: Claude with code execution and tappable choices. The tester played the giver from the persona; the AI turns follow SKILL.md and references as written. `[→ rule]` marks which instruction drove the turn; `[GAP]` marks where the skill gave no guidance and the AI had to improvise.

---

**User:** ผมเป็นช่างแอร์ จะย้ายไปสาขาอื่น อยากส่งต่อวิธีล้างแอร์และตรวจเช็คให้น้องใหม่ (แนบรูป 2 รูป)

**AI:** ได้เลยครับ ผมจะถามทีละนิด ส่วนใหญ่กดเลือกได้ แล้วรวบรวมเป็นไฟล์คู่มือให้น้องใหม่เปิดดูได้ในมือถือ บันทึกไฟล์ในแชตนี้ได้ แต่ถ้าเปิดแชตใหม่ผมจะจำไม่ได้ จะให้ "รหัสบันทึก" ไว้ทุกช่วงครับ `[→ start: host capability, plain words]`
ก่อนเริ่ม: คู่มือจะใช้สีหลักอะไรดีครับ? [ส้ม (ค่าเริ่มต้น)] [น้ำเงิน] [เขียว] [อื่นๆ] `[→ giver step 1: accent]`
`[GAP] Asking a colour as the very first question felt odd for a technician who came to talk about cleaning air-cons; it delays the real conversation.`

**User:** ส้มก็ได้

**AI:** เห็นรูปแล้วครับ รูปแรกเป็นหน้าเครื่องแอร์ตัวในที่เปิดฝาแล้ว รูปที่สองเป็นคอยล์ร้อนกับท่อน้ำทิ้ง ผมจะใช้รูปจริงพวกนี้ในขั้นตอนนะครับ `[→ discovery 1: read material first]`
งานของพี่ในหนึ่งเดือน มีอะไรบ้างครับ (เลือกได้หลายข้อ) [ล้างแอร์ตามนัด] [ตรวจเช็คก่อนล้าง] [เติมน้ำยา] [ซ่อมแอร์ไม่เย็น/น้ำหยด] [ติดตั้งเครื่องใหม่] [ออกใบเสนอราคา] [เช็คอะไหล่/เบิกของ] [นัดลูกค้า] [อื่นๆ] `[→ discovery 3: likely tasks]`

**User:** ล้าง ตรวจเช็ค ซ่อมน้ำหยด เบิกของ นัดลูกค้าแอดมินทำ

**AI:** มีอะไรค้างอยู่ที่น้องต้องรู้ทันทีไหมครับ เช่น งานที่นัดไว้แล้ว ลูกค้าที่รอ อะไหล่ที่สั่งไว้ `[→ giver step 3: pending early]`

**User:** มีนัดล้างคอนโดหลังหนึ่ง 12 เครื่อง วันที่ 2 ธันวา แล้วมีลูกค้าเจ้าหนึ่งน้ำหยดยังแก้ไม่จบ รอท่อมา

**AI:** จดไว้แล้วครับ (ในเรื่องด่วน) ลำดับที่จะเก็บ: 1) ล้างแอร์ + ตรวจเช็ค (ทำบ่อยสุด และน้องต้องใช้วันที่ 2) 2) ซ่อมน้ำหยด 3) เบิกของ โอเคไหมครับ `[→ discovery 5: order]` (role map drawn as a small tree; giver taps "โอเค")

**AI:** เริ่มจากล้างแอร์นะครับ ก่อนเปิดเครื่อง พี่ทำอะไรเป็นอย่างแรก

**User:** ปิดเบรกเกอร์ก่อน ถอดปลั๊กถ้ามี ไม่งั้นโดนช็อตได้

**AI:** ขั้นนี้ผมใส่เป็นขั้นความปลอดภัย และให้น้องทำตามระเบียบความปลอดภัยของบริษัทด้วยนะครับ บริษัทมีเอกสารความปลอดภัยงานไฟฟ้าไหมครับ `[→ images-and-safety: safety:true, point to official procedure]`

**User:** มีใบ checklist ก่อนขึ้นงาน แต่ไม่มีไฟล์

**AI:** ได้ครับ ผมจะลิงก์ไว้ว่า "ดู checklist ก่อนขึ้นงานของบริษัท" … (continues: ladder/heights → safety; filter removal; spray coil with plastic cover; outdoor coil; drain check; test run 15 นาที)

**User:** ล้างคอยล์ก็ฉีดน้ำไป ดูว่าสะอาดก็พอ

**AI:** "ดูว่าสะอาด" ดูจากอะไรครับ เช่น สีน้ำที่ไหลออก หรือครีบคอยล์ `[→ interview: probing vague words]`

**User:** น้ำที่ไหลลงถุงต้องใสแล้ว ครีบไม่มีขี้ฝุ่นจับ

**AI:** (pins proposed on P01-S02: 1 filter left, 2 filter right, 3 breaker — "หมุด 3 อยู่ที่เบรกเกอร์ถูกไหมครับ?") `[→ images: confirm pins]` Giver confirms 1–2, says breaker is actually on the wall outside the photo → pin 3 removed.

**AI:** (draws flowchart for the pre-check: เย็นไหม → น้ำหยดไหม → เสียงดังไหม) "ถูกไหมครับ?" `[→ show, don't make them write]`

**AI:** แต่ละขั้น ใครทำได้บ้างครับ: ขั้น 1 ปิดเบรกเกอร์ [คนทำเท่านั้น] [AI ช่วยได้โดยมีคนอนุมัติ] [AI ทำเองได้] `[→ interview: who_can_do per step]`
`[GAP] Asking an AI-capability label for each physical step (6 steps × 1 tap) was noise: every step is hands-on. A single "all steps are done by hand — right?" would have done.`

**User:** ก็คนทำหมดแหละ

**AI:** (review summary with badges; giver corrects test run from 10 to 15 minutes) → builds the Pack, gives zip + handover message, save block v3. `[→ steps 5–6]`
Giver sends photos as chat attachments; the AI copied them into `images/` with step names itself.
`[GAP] saving-and-hosts.md says what to tell a text-only giver about image names, but not that a file-capable host should save the uploaded images under step names itself.`

## Result
- Pack built: `out/` (warnings checked below). Save block given at the end.
- Hard checks: pass (no invented steps; photos real and pinned with confirmation; safety steps `safety: true` kept `employee_provided`; no passwords; Thai throughout; questions tappable).
- Must-show: photos used ✓, safety marked ✓, no fixed job list ✓ (checklist generated for an AC technician).

## Findings
1. Accent colour as the first question is awkward for non-office givers. → Ask it at build time instead (still before every pack).
2. Per-step "who can do it" taps are noise for physical work. → Allow one confirmation per task when all steps are clearly hands-on.
3. File-capable hosts should store uploaded images under step names themselves.
