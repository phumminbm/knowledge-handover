# Scenario 14 — Head cook, made-to-order restaurant (TH, photo, "by feel")

Host simulated: ChatGPT-style text chat **without** file writing or code (mode 3: save blocks + Pack Builder), to test the free-plan path.

---

**User:** พี่เป็นกุ๊กร้านอาหารตามสั่ง จะไปเปิดร้านเอง อยากสอนน้องที่มาแทนเรื่องเตรียมของตอนเช้ากับสูตรน้ำซุป (แนบรูปชั้นวางของ)

**AI:** ยินดีด้วยครับที่จะเปิดร้านเอง ผมจะถามสั้นๆ ทีละข้อ แล้วทำเป็นคู่มือให้น้อง แชตนี้บันทึกไฟล์ไม่ได้ และแชตใหม่จะจำไม่ได้ ผมจะให้ "ข้อความบันทึก" ไว้ก๊อปเก็บทุกครั้งที่จบช่วงนะครับ `[→ start: mode 3 said plainly]`
คู่มือจะใช้สีอะไรดีครับ 1) ส้ม (ค่าเริ่มต้น) 2) เขียว 3) แดง 4) อื่นๆ
`[GAP] Same as scenario 9: colour first is out of place.`

**User:** 1

**AI:** เห็นรูปแล้วครับ ตู้เย็นมีหมูชั้นบน ไก่ชั้นกลาง ผักชั้นล่าง ถูกไหมครับ
(→ giver confirms; "หมูต้องอยู่บนสุดเพราะ…" — AI asks why → "ไม่ใช่ เนื้อดิบต้องอยู่ล่างสุดจริงๆ แต่ร้านเราวางผิดมานาน" → contradiction between practice and a food-safety rule.)

**AI:** ขอบคุณที่บอกครับ ผมจะจดไว้ทั้งสองแบบ: ที่ร้านวางจริงตอนนี้ กับที่พี่บอกว่าควรเป็น แล้วทำเป็นคำถามค้างให้เจ้าของร้านตัดสินนะครับ เรื่องเก็บของสดเป็นเรื่องความปลอดภัยอาหาร ผมจะไม่เดาเอง `[→ contradictions; safety]`

**AI (น้ำซุป):** ใส่อะไรบ้าง ปริมาณเท่าไรครับ

**User:** กระดูกหมูประมาณครึ่งหม้อ น้ำเต็มหม้อ ไชเท้า ซีอิ๊ว ชิมเอาว่าพอดี

**AI:** "ชิมเอาว่าพอดี" น้องจะรู้ได้ยังไงว่าพอดีครับ เช่น เค็มนำ หวานนิดๆ หรือมีอะไรที่ใช้เทียบได้ `[→ probing vague words]`

**User:** เค็มนำนิดๆ ไม่หวาน ถ้าเติมแล้วยังจืดก็ซีอิ๊วทีละช้อน หม้อที่ใช้ใบ 30 ลิตร

**AI:** (records: หม้อ 30 ลิตร, กระดูกประมาณครึ่งหม้อ, เติมซีอิ๊วทีละช้อนจนเค็มนำ ไม่หวาน; no gram amounts invented; asks whether to weigh once next time → added as open question) `[→ never invent]`

**AI (images, mode 3):** รูปนี้ช่วยมากครับ แต่ข้อความบันทึกเก็บรูปไม่ได้ ให้ตั้งชื่อไฟล์ว่า `P01-S01.jpg` เก็บไว้ในโฟลเดอร์เดียวกัน ตอนท้ายจะใส่รูปในหน้า Pack Builder ครับ `[→ images: text-only]`

**AI (supplier):** ร้านซื้อของจากใคร น้องต้องโทรสั่งใครครับ
**User:** เจ๊แดงตลาด เบอร์ 08x-xxx-xxxx ราคาหมูกิโลละ 140
**AI:** เบอร์ร้านส่งของน้องต้องใช้ ผมใส่ไว้ได้ แต่ถ้าเป็นเบอร์ส่วนตัวของเจ๊แดง เจ๊โอเคไหมที่จะอยู่ในคู่มือครับ ราคาผมจะใส่เป็น "ราคาล่าสุดที่พี่จำได้" เพราะเปลี่ยนบ่อย
`[GAP] The skill says to mask names and numbers, but the receiver needs the supplier contact to do the job. Nothing tells the AI how to tell needed data from incidental data, so the AI improvised a consent question.`

End of session: AI gives the cumulative save block v2 (`KNOWLEDGE-HANDOVER SAVE · KP-2569-1414 · v2 · 2026-11-23`) and explains the Pack Builder steps (paste block → drop `P01-S01.jpg` → download zip). `[→ build without code]`

## Result
- Built in the Pack Builder flow (simulated with the CLI, same core).
- Hard checks: pass. "By feel" turned into observable cues; no invented grams; contradiction kept with an open question; food storage marked `safety`.
- Must-show: probing ✓, food-safety steps ✓, photo ✓, supplier contact handled — but only by improvisation.

## Findings
1. Colour first (again).
2. Needed vs incidental personal data needs explicit guidance.
3. Save block length for a text-only free chat was fine at this size (≈6 KB); not tested with 5+ tasks.
