# WIRA Nusantara — WhatsApp Gateway

Service lokal berbasis **whatsapp-web.js** untuk mengirim pesan ke grup WhatsApp dari WIRA.

## Cara Setup & Jalankan

### 1. Install Dependencies
```bash
cd whatsapp-gateway
npm install
```

> ⚠️ `whatsapp-web.js` membutuhkan **Chromium/Puppeteer** — pastikan terinstall:
> - macOS: `brew install chromium` atau biarkan Puppeteer download otomatis
> - Proses install pertama bisa memakan waktu ~5 menit (download Chromium)

### 2. Jalankan Service
```bash
node index.js
```

### 3. Scan QR Code
- QR code akan muncul di terminal
- Buka WhatsApp di HP → **Perangkat Tertaut** → **Tautkan Perangkat**
- Scan QR code tersebut

### 4. Service Siap!
Setelah scan berhasil:
```
🚀 WIRA Gateway SIAP!
📞 Nomor: 62812xxxxxxxx
👤 Nama:  Nama Kamu
🌐 URL:   http://localhost:3001
```

Session disimpan di `.wwebjs_auth/` — tidak perlu scan ulang setiap kali restart.

---

## API Reference

### `GET /health`
Health check dasar.
```json
{ "status": "ok", "service": "WIRA WhatsApp Gateway" }
```

### `GET /status`
Status koneksi WhatsApp.
```json
{
  "status": "ready",
  "connected": true,
  "info": { "phone": "62812xxxxxxxx", "name": "Nama Kamu" }
}
```

### `POST /send`
Kirim pesan ke satu nomor atau grup.
```json
// Request body:
{
  "to": "628123456789@c.us",
  "message": "*Laporan Operasional PLN*\nUnit 1: Normal ✅\nUnit 2: Standby ⚡"
}

// Format ID Grup WA: "628123456789-1619123456@g.us"
// Format nomor biasa: "628123456789" atau "628123456789@c.us"
```

### `POST /send-bulk`
Kirim ke beberapa tujuan sekaligus.
```json
{
  "targets": ["628xxx@c.us", "1203685342-123456@g.us"],
  "message": "Isi pesan broadcast",
  "delay": 2000
}
```

---

## Cara Dapat Group ID WhatsApp

1. Jalankan gateway dan sudah ready
2. Kirim pesan ke grup dari HP
3. Bot akan menerima pesan — jalankan kode debug ini di `index.js` sementara:
   ```js
   client.on('message', (msg) => {
       console.log('Chat ID:', msg.from); // Ini adalah group_id yang dicari
   });
   ```
4. Group ID format: `1203685342-1619123456@g.us`

---

## Catatan Penting

> ⚠️ **Risk**: Menggunakan WhatsApp unofficial API memiliki risiko akun diblokir oleh Meta jika terdeteksi sebagai bot atau mengirim pesan massal secara berlebihan.

**Tips aman:**
- Gunakan nomor khusus (bukan nomor utama) untuk produksi
- Batasi frekuensi pengiriman (gunakan `delay` minimal 1500ms pada bulk send)
- Pastikan hanya mengirim ke grup yang kamu admin/member

---

*WIRA Nusantara — PLN NP Unit Pelaksana Kendari*
