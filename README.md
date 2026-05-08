# kamun

เว็บผู้ช่วยการบ้านสำหรับเด็ก มี LLM ช่วยตอบ/พาคิด และระบบกล้องเก็บ focus log เบื้องหลัง

## Local

```bash
npm start
```

เปิด:

```text
http://127.0.0.1:4173
```

ตั้งค่า `.env` จาก `.env.example`

## Deploy

ใช้ได้กับ Node hosting เช่น Render, Railway, Fly.io หรือ VPS

### Environment Variables

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
HOST=0.0.0.0
```

`PORT` ให้ platform เป็นคนกำหนดได้ ถ้าไม่กำหนดจะใช้ `4173`

### Build Command

```text
npm install
```

### Start Command

```text
npm start
```

## Notes

- อย่า commit `.env`
- กล้องบน production ต้องรันผ่าน HTTPS เพื่อให้ browser อนุญาต camera permission
- `data/focus-logs.json` บน platform ฟรีหลายเจ้าอาจเป็น ephemeral storage ถ้าต้องเก็บถาวรควรต่อ database หรือ volume
