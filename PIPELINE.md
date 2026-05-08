# kamun Pipeline

## เป้าหมาย

เว็บช่วยเด็กเรียนแบบปลอดภัย มีคอร์สให้เลือก, LLM ช่วยตอบ/พาคิด, และมีกล้องตรวจพฤติกรรมเก็บ log เบื้องหลังโดยไม่โชว์บนหน้าเว็บ

## Flow หลัก

```text
เปิดเว็บ
  -> โหลด UI + app.js
  -> โหลดโมเดลกล้อง MediaPipe
  -> ขอ permission กล้อง
  -> กล้องเก็บ focus log เบื้องหลัง

เลือกวิชา
  -> เก็บ state.selectedCourse
  -> เปลี่ยน placeholder ตามวิชา

พิมพ์คำถาม
  -> เก็บ typing metrics
  -> รวม camera signal + course + text

กดส่ง
  -> POST /api/behavior-analysis
  -> server เรียก OpenAI
  -> ส่งคำตอบกลับมาแสดงใน chat
  -> บันทึก checkin log
```

## ระบบกล้องเบื้องหลัง

- ใช้ MediaPipe ตรวจหน้า, ท่านั่ง, มือ
- คำนวณ `eye`, `posture`, `action`, `presence`, `focus`
- สร้าง event เช่น มองออกนอกจอ, ท่านั่งเปลี่ยน, มือขยับ
- UI กล้องถูกซ่อนด้วย CSS ไม่โชว์เด็ก

## Log

```text
localStorage: kamunLogs
backend: POST /api/focus-log
file: data/focus-logs.json
```

ประเภท log:

- `camera-snapshot`
- `event`
- `checkin`

## LLM Policy

- คิดเลข/คำนวณ: ไม่เฉลยทันที พาคิดทีละขั้น
- โค้ดดิ้ง: ไม่ให้ solution เต็มทันที พาดีบักทีละจุด
- วิชาอื่น: ตอบตรงได้
- ถ้าถามสรุป/ใจความสำคัญ/นิยาม: ตอบสั้น เน้นประเด็นสำคัญ
- ถ้า OpenAI ใช้ไม่ได้: ใช้ fallback ใน `app.js`

## ไฟล์สำคัญ

- `index.html` UI + course cards
- `styles.css` layout และซ่อนกล้อง
- `app.js` frontend logic, camera, metrics, fallback
- `server.mjs` API, log, OpenAI bridge
- `data/focus-logs.json` log storage
