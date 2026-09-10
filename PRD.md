# Product Requirement Document (PRD)
## WIRA Nusantara — WhatsApp Informations Resource Assistant
**PLN Nusantara Power — Unit Pelaksana (UP) Kendari**

---

| Dokumen | Keterangan |
| :--- | :--- |
| **Nama Produk** | WIRA (WhatsApp Informations Resource Assistant) |
| **Instansi** | PT PLN Nusantara Power — Unit Pelaksana (UP) Kendari |
| **Versi** | 1.0.0 |
| **Status** | Active Development |
| **Arsitektur** | Federated Data Architecture (Stateless AI Hub / Zero-Database) |
| **Repository** | `ardykaaw/wira-chat` |

---

## 1. Executive Summary & Visi Produk

**WIRA (WhatsApp Informations Resource Assistant)** adalah asisten kecerdasan buatan (*AI Operational Assistant*) terpadu yang dirancang khusus untuk memfasilitasi monitoring pembangkit, tracking pemeliharaan (*maintenance*), penanganan alarm/gangguan (*outage*), pengadaan sparepart, serta diseminasi informasi otomatis ke grup-grup resmi WhatsApp internal di lingkungan **PLN Nusantara Power UP Kendari** (mencakup PLTD Poasia, PLTU Nii Tanasa, PLTM, dan unit layanan terkait).

### Visi Utama
Mewujudkan asisten operasional yang **responsif, cerdas, aman, dan taat azas kedaulatan data (*Data Sovereignty*)**, di mana WIRA bertindak sebagai orkestrator cerdas tanpa menduplikasi atau menyimpan data rahasia perusahaan ke database lokal (*Stateless AI Hub*).

---

## 2. Arsitektur Sistem: *Stateless AI Hub & Data Federation*

WIRA menerapkan arsitektur federasi data tanpa penyimpanan database operasional (*Zero Operational Database Persistence*). Semua data ditarik secara *real-time* atau diterima melalui *event push*.

```
[Maximo / Omamo / External Apps]
           │ (Push/Sync)
           ▼
       [ Monday ]
           │ 
           │ (Event-Driven Push / Webhook — Monday menginisiasi ke WIRA)
           ▼
 ┌────────────────────────────────────────────────────────┐
 │            WIRA (Stateless / Tanpa Database)           │
 └───────────────────────┬────────────────────────────────┘
                         │
        (On-Demand Pull Request saat ada pertanyaan)
        ┌────────────────┼────────────────┬───────────────┐
        ▼                ▼                ▼               ▼
  [Datakompak]      [Pengadaan]        [Outage]      [App Wira]
 (Data Operasi)    (Sparepart/PO)   (Pemadaman/Trip) (Admin Data Center)
```

### Prinsip Alur Data:
1. **Stateless Core Engine:**
   - WIRA tidak memiliki database tabel data operasional (beban MW, temperatur oli, log kegagalan mesin tidak disimpan di WIRA).
   - WIRA hanya memegang cache memori sementara (*in-memory / transient context*) selama sesi tanya-jawab berlangsung.
2. **Model *Pull* (On-Demand API Request — Garis Biru):**
   - Saat operator/manajemen mengajukan pertanyaan, WIRA secara dinamis melakukan *HTTP request* ke API tujuan:
     - **Datakompak:** Telemetry beban operasi, frekuensi (Hz), status unit pembangkit.
     - **Pengadaan:** Status ketersediaan material, Purchase Order (PO), pengiriman sparepart kritis.
     - **Outage:** Catatan gangguan, pemadaman, dan status *tripping* mesin.
     - **App Wira:** Data Center & konfigurasi master data internal UP Kendari.
3. **Model *Push* (Monday Aggregator — Garis Abu-abu):**
   - Aplikasi hulu (*Maximo, Omamo, dll.*) menyinkronkan status tiket kerja dan aset ke **Monday**.
   - **Monday yang mengirim data ke WIRA** via Webhook/Push event. WIRA tidak menembak Monday secara aktif.
   - Data riwayat pemeliharaan (*work order*) dijawab oleh WIRA menggunakan payload event terkini dari Monday.

---

## 3. Fitur Utama & Spesifikasi Fungsional

### A. Antarmuka Chatbot Cerdas (*Web Chat Interface*)
* **Desain UI:** Modern, responsif, dark/light mode adaptif dengan identitas visual PLN Nusantara Power (warna khas `#2F6C8E` dan aksen kuning PLN `#FFD200`).
* **Format Output:** Dukungan penuh rendering Markdown (tabel data, list numerik, blok peringatan, teks tebal/miring).
* **Multi-modal Attachment:**
  * Pengguna dapat mengunggah gambar/foto indikator mesin, display panel, PDF, atau file log (hingga 20MB) via tombol Paperclip.
  * Dilengkapi *preview chip* sebelum pengiriman dan tampilan kartu dokumen di dalam *bubble chat*.
  * Integrasi multimodal ke LLM untuk analisis citra display kontroler.
* **Manajemen Riwayat Sesi:**
  * Pengelolaan percakapan (*create*, *rename*, *delete*).
  * Penghapusan percakapan menggunakan modal konfirmasi custom (*tanpa window.confirm bawaan browser*).

### B. WhatsApp Gateway (Self-Hosted Node.js Engine)
* **Teknologi:** `whatsapp-web.js` dan Puppeteer berjalan lokal di port 3001.
* **Keamanan Privasi (Anti-Hijack & Anti-OTP Leak):**
  * Sesi disimpan lokal di server sendiri (`.wwebjs_auth`), tanpa keterlibatan pihak ketiga (mencegah risiko kebocoran OTP/akun belanja seperti pada SaaS publik).
* **Fitur In-App QR Scanning:**
  * Modal koneksi interaktif di web app WIRA yang menampilkan QR Code *real-time* via Base64 Data URL.
  * Auto-polling status koneksi (Initializing $\rightarrow$ QR Ready $\rightarrow$ Authenticated $\rightarrow$ Ready).
  * Menampilkan informasi nomor terhubung dan tombol *Disconnect / Logout*.

### C. WhatsApp Broadcast Hub
* **Data Master Grup WhatsApp:** Pengelolaan daftar grup penerima laporan (Grup Operasi, Grup Manajemen, Grup Pemeliharaan, Grup K3L).
* **Broadcast Modal:**
  * Pemilihan target multi-grup dengan checkbox interaktif.
  * Preview dan penyuntingan isi pesan sebelum dikirim.
  * Pengiriman langsung via endpoint `/wira/whatsapp/send`.
  * Status notifikasi toast dengan ikon keberhasilan pengiriman.

### D. LLM Reasoning Engine & Kepatuhan Keamanan
* **Dukungan Model Enterprise:**
  * **OpenAI API (GPT-4o-mini / GPT-4o):** Kebijakan *Zero Data Retention (ZDR)* / *No Training on API Data* dengan biaya *pay-as-you-go* yang sangat hemat.
  * **Google Cloud Vertex AI:** Perlindungan data B2B Google Enterprise.
  * **On-Premise LLM (Ollama / vLLM):** Dukungan model lokal (Llama 3.3 / Qwen 2.5) untuk skenario jaringan offline/intranet PLN 100%.
* **Smart Operational Fallback:** Jika koneksi LLM mengalami kendala, engine cerdas internal WIRA tetap mampu menjawab status operasi, histori maintenance, dan alert penting.

---

## 4. Spesifikasi Teknologi (Tech Stack)

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework Backend** | Laravel 12 (PHP 8.2+) | REST API, Controllers, CSRF Security, Inertia Middleware |
| **Frontend Framework** | React 19 + TypeScript | Single Page Application via Inertia.js v2 |
| **Styling & Icons** | Tailwind CSS v4, Lucide React | Modern aesthetic, dark/light theme, custom scrollbars |
| **Alert & Notifications** | Sonner Toast | Toast notification elegan dengan custom status icon |
| **WhatsApp Gateway** | Node.js, Express, `whatsapp-web.js`, `qrcode` | Microservice lokal penghubung WhatsApp multi-device |
| **Database Lokal** | SQLite / MySQL | Hanya untuk session, user auth, dan master grup WA |
| **Environment Server** | macOS Laravel Herd (Dev) / Linux Ubuntu (Prod) | Nginx / PHP-FPM / Node daemon |

---

## 5. Struktur Route & API Endpoints

### Route Percakapan & UI (Web)
* `GET  /dashboard` $\rightarrow$ Tampilan utama Chat WIRA
* `POST /wira/chat/conversations` $\rightarrow$ Membuat percakapan baru
* `POST /wira/chat/conversations/{id}/messages` $\rightarrow$ Mengirim pesan + attachment (Multipart/JSON)
* `PATCH /wira/chat/conversations/{id}/title` $\rightarrow$ Mengubah nama percakapan
* `DELETE /wira/chat/conversations/{id}` $\rightarrow$ Menghapus percakapan

### Route Data Master Grup WhatsApp
* `GET    /wira/whatsapp-groups` $\rightarrow$ Halaman kelola grup
* `POST   /wira/whatsapp-groups` $\rightarrow$ Tambah grup baru
* `PATCH  /wira/whatsapp-groups/{id}` $\rightarrow$ Update grup
* `DELETE /wira/whatsapp-groups/{id}` $\rightarrow$ Hapus grup

### Route WhatsApp Gateway & Broadcast
* `GET  /wira/whatsapp/status` $\rightarrow$ Status gateway & Base64 QR Code
* `POST /wira/whatsapp/send` $\rightarrow$ Kirim pesan broadcast ke grup
* `POST /wira/whatsapp/logout` $\rightarrow$ Putuskan sesi koneksi WhatsApp

### Route Integrasi Eksternal (Planned)
* `POST /api/webhooks/monday` $\rightarrow$ Receiver push data dari Monday
* `GET  /api/v1/tools/datakompak` $\rightarrow$ Adapter on-demand telemetry Datakompak
* `GET  /api/v1/tools/pengadaan` $\rightarrow$ Adapter on-demand PO & Material
* `GET  /api/v1/tools/outage` $\rightarrow$ Adapter on-demand riwayat trip & outage

---

## 6. Standar Keamanan & Kepatuhan Data (*Security & Compliance*)

1. **Anti-Leak Session Security:** Sesi WhatsApp tidak pernah diproses oleh server pihak ketiga manapun.
2. **Strict CSRF Validation:** Semua mutating request dilindungi token CSRF otomatis dari Laravel/Inertia.
3. **No-Training Policy:** Penggunaan LLM wajib memanfaatkan tier Enterprise (ZDR) atau Local Model sehingga data telemetry pembangkit tidak melatih model publik.
4. **Credential Isolation:** API Keys, token gateway, dan kredensial database disimpan secara eksklusif pada file `.env` yang tidak masuk ke repository git.

---

## 7. Rencana Pengembangan (*Roadmap*)

- [x] **Fase 1 (Selesai):** Pembuatan UI Web Chat responsif, WhatsApp Gateway self-hosted, modul broadcast grup, dan integrasi multimodal file.
- [ ] **Fase 2 (Sedang Berjalan):** Pembangunan aplikasi pendamping **App Wira** (Admin Portal & Internal Data Center).
- [ ] **Fase 3:** Implementasi Webhook Monday dan Adapter API untuk Datakompak, Pengadaan, dan Outage.
- [ ] **Fase 4:** Pengujian integrasi end-to-end, load testing, dan deployment ke server on-premise PLN UP Kendari.
