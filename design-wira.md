# WIRA — Design.md
### Spesifikasi Visual Antarmuka Chat

Dokumen ini melengkapi *WIRA AI App Technical Design* — bagian itu menentukan **struktur & data** antarmuka chat (sidebar riwayat, message stream, citation, streaming, feedback); dokumen ini menentukan **tampilannya**.

---

## 1. Prinsip Desain

WIRA dipakai oleh operator dan engineer pembangkit — bukan konsumen mencoba chatbot baru. Desainnya harus terasa seperti **alat kerja presisi**, bukan demo AI yang genit. Dua elemen listrik jadi dasar arah visual, bukan kebetulan:

- **Biru** — arus, sinyal, data yang mengalir.
- **Maron** — bara, panas pembangkitan, warna yang lebih berat dan bersahaja dibanding biru murni.

Gradasi antara keduanya (bukan warna flat, bukan ungu di tengah yang generik) jadi latar utama — mengacu pada nuansa referensi yang Anda kirim (gradasi gelap dengan panel kaca mengambang di atasnya), tapi diterjemahkan ke palet biru→maron milik WIRA, bukan ungu.

**Instruksi eksplisit yang mengikat seluruh dokumen ini:** tidak ada elemen yang menandakan "ini produk AI" secara klise. Lihat Bagian 2.

---

## 2. Yang Dihindari Secara Eksplisit

Ini bukan saran, ini larangan desain:

- **Tidak ada ikon** dalam bentuk apa pun — bukan ikon kirim (pesawat kertas), bukan ikon microphone, bukan ikon thumbs-up/down, bukan ikon gear/setting, bukan ikon "+" untuk sesi baru. Semua kontrol memakai **teks**.
- **Tidak ada avatar** — tidak ada lingkaran bot, tidak ada gradient orb, tidak ada inisial di lingkaran untuk user maupun WIRA.
- **Tidak ada sparkle/bintang** (✨) atau elemen "AI magic" lain yang jadi klise chatbot generatif.
- **Tidak ada bubble berwarna-warni** untuk jawaban AI. Jawaban WIRA tampil sebagai teks bacaan biasa (editorial), bukan gelembung chat.
- **Tidak ada "typing dots"** (● ● ●) untuk status sedang memproses — ganti dengan detail motion pada input dock (Bagian 6).
- **Tidak ada emoji** di UI sistem (termasuk 👋 pada sapaan pembuka) — nada WIRA tetap profesional.
- **Tidak ada label ALL CAPS**, tidak ada eyebrow label di atas setiap judul, tidak ada tanda panah "→" di akhir tombol.

---

## 3. Design Tokens — Warna

| Token | Hex / Value | Peran |
|---|---|---|
| `void` | `#0A0E1F` | Dasar latar, hampir hitam-navy |
| `deep-current` | `#14245A` | Titik tengah gradasi — biru dalam |
| `ember` | `#5A1228` | Titik akhir gradasi — maron gelap |
| `signal` | `#3E5CE0` | Warna aksi/interaktif utama (tombol, link, focus ring) |
| `glass` | `rgba(255,255,255,0.06)` fill · `rgba(255,255,255,0.14)` border | Permukaan panel kaca |
| `mist` | `#EEEAE4` | Teks utama (putih hangat, bukan putih murni) |
| `mist/60` | `rgba(238,234,228,0.58)` | Teks sekunder/meta |

**Latar utama:** `linear-gradient(160deg, void 0%, deep-current 45%, ember 100%)`, statis (tidak animasi) — gradasi ini backdrop, bukan pusat perhatian.

**Kapan pakai `signal` vs `ember` sebagai aksen:** `signal` untuk semua elemen yang bisa diklik/aktif (tombol, tautan, ring fokus). `ember` hanya muncul di elemen non-interaktif (garis pemisah halus, motion border) — supaya user tidak salah menduga elemen ber-`ember` itu bisa diklik.

---

## 4. Design Tokens — Tipografi

| Peran | Typeface | Alasan |
|---|---|---|
| UI & body text | **General Sans** | Grotesk modern, netral tapi punya karakter — bukan Inter default |
| Data teknis (timestamp, correlation ID, rujukan sumber, angka parameter) | **IBM Plex Mono** | Plex dirancang untuk konteks teknis/enterprise — cocok untuk data operasional PLN yang memang berbentuk kode/angka, bukan dekorasi |

**Skala tipe:**

| Elemen | Ukuran/leading | Weight |
|---|---|---|
| Judul empty-state | 32px / 1.15 | 500 |
| Isi jawaban WIRA & pesan user | 16px / 1.6 | 400 |
| Meta (waktu, sesi) | 13px mono / 1.4 | 400, tracking normal (bukan caps) |
| Rujukan/citation | 13px mono / 1.4 | 400 |

Line length isi jawaban dibatasi **~72 karakter** per baris pada layar lebar (bukan melebar penuh) — supaya nyaman dibaca seperti dokumen, bukan seperti kolom chat sempit.

---

## 5. Spacing, Radius & Permukaan Kaca

Radius **sengaja tidak seragam** — ini alat hierarki, bukan detail kosmetik:

| Elemen | Radius | Alasan |
|---|---|---|
| App shell, sidebar, garis struktural | `4px` | Terasa arsitektural/tegas — ini kerangka, bukan yang disentuh langsung |
| Input dock, bubble pesan user, kartu citation | `20px` | Lebih lunak — ini yang disentuh/diklik langsung |

**Permukaan kaca (glassmorphism):**
```css
background: rgba(255,255,255,0.06);
backdrop-filter: blur(20px) saturate(140%);
border: 1px solid rgba(255,255,255,0.14);
box-shadow: 0 8px 32px rgba(10,14,31,0.35);
```
Dipakai pada: sidebar panel, input dock, kartu citation. **Tidak** dipakai pada teks jawaban WIRA itu sendiri — jawaban tetap teks polos di atas gradasi, tanpa bingkai kaca, supaya terasa seperti membaca, bukan menerima pesan dari kotak.

---

## 6. Motion — Outline Bergerak (Satu Momen Signature)

Ini satu-satunya elemen animasi berkelanjutan di seluruh antarmuka — sesuai prinsip "satu keberanian, di satu tempat": semua yang lain diam.

**Di mana:** garis tepi **input dock** (kotak tempat user mengetik pertanyaan). Bukan di setiap kartu, bukan di setiap tombol saat hover.

**Perilaku:**
- Saat idle: pita cahaya tipis (2px) bergerak pelan mengelilingi tepi input dock, berputar dari `signal` (biru) ke `ember` (maron) dan kembali — siklus ±6 detik, sangat halus, seperti arus yang mengalir pelan di tepi kaca.
- Saat user mengetik: kecepatan sedikit meningkat — motion merespons aksi, bukan berputar random.
- Saat WIRA sedang menyusun jawaban (streaming): pita cahaya berpindah dari mengelilingi input dock ke mengelilingi **tepi kiri kolom jawaban** yang sedang ditulis — ini pengganti "typing dots", memberi tahu "sedang berlangsung" tanpa ikon apa pun.
- **Menghormati `prefers-reduced-motion`:** jika aktif, ganti motion dengan garis statis warna `signal` solid, tanpa animasi.

**Implementasi (CSS, conic-gradient berputar):**
```css
.input-dock {
  position: relative;
  border-radius: 20px;
  background: rgba(255,255,255,0.06);
}
.input-dock::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(from var(--angle), #3E5CE0, #5A1228, #3E5CE0);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate-border 6s linear infinite;
}
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes rotate-border { to { --angle: 360deg; } }

@media (prefers-reduced-motion: reduce) {
  .input-dock::before { animation: none; background: #3E5CE0; }
}
```

---

## 7. Layout

```
┌──────────────┬────────────────────────────────────────────┐
│  SIDEBAR      │  MESSAGE STREAM                             │
│  (glass,      │  (di atas gradasi void→current→ember)       │
│  radius 4px)  │                                              │
│               │   [pesan user — bubble glass, rata kanan]    │
│  Percakapan   │                                              │
│  baru         │   jawaban WIRA — teks polos, rata kiri,      │
│  ─────────    │   lebar baca ~72 karakter, tanpa bubble      │
│  Sesi 12 Sep  │                                              │
│  Sesi 10 Sep  │   ¹ rujukan  ² rujukan   ← footnote style    │
│  Sesi 8 Sep   │                                              │
│               ├────────────────────────────────────────────┤
│               │  INPUT DOCK (glass, radius 20px,             │
│               │  outline bergerak — Bagian 6)                │
└──────────────┴────────────────────────────────────────────┘
```

- Sidebar rata kiri, daftar sesi hanya teks (judul percakapan + tanggal dalam mono 13px) — tanpa ikon apa pun, tanpa badge jumlah.
- Tombol "Percakapan baru" adalah teks bergaris bawah tipis, bukan tombol berikon "+".
- Pesan **user**: bubble kaca kecil, rata kanan, radius 20px, teks `mist`.
- Jawaban **WIRA**: **tanpa bubble**, rata kiri, lebar dibatasi, membaca seperti paragraf dokumen — ini yang paling membedakan dari tampilan "chatbot" generik.

---

## 8. Spesifikasi Komponen

### 8.1 Empty state (sesi baru)
Judul editorial, bukan sapaan generik:

> **Ada yang perlu ditemukan?**
> Cari SOP, parameter mesin, atau status pekerjaan.

Tanpa emoji, tanpa nama produk dibesarkan dengan gradient text, tanpa sparkle. Judul + satu baris penjelas, selesai.

### 8.2 Rujukan / Citation
Ditampilkan sebagai **footnote** bernomor superskrip di akhir kalimat terkait (¹ ² ³), bukan chip/badge berwarna dengan ikon dokumen. Daftar lengkap rujukan muncul di bawah jawaban dalam mono 13px:
```
¹ SOP-OPS-014 · Prosedur Start-Up Genset
² Maximo · Work Order #WO-88213
```

### 8.3 Status diblokir (DLP/otorisasi menolak)
Bukan pesan error merah dengan ikon larangan. Tampil sebagai teks `mist/60` di posisi jawaban:
> *Informasi ini di luar cakupan akses Anda saat ini. Hubungi pemilik data terkait bila diperlukan.*

Nada tetap tenang, faktual — sesuai prinsip: sistem tidak minta maaf, tidak samar soal apa yang terjadi (lihat panduan penulisan di Bagian 9).

### 8.4 Feedback
Dua tautan teks kecil di bawah tiap jawaban WIRA, bukan ikon jempol:
```
Berguna · Kurang tepat
```
Diklik → berubah warna `signal`, tanpa animasi tambahan.

### 8.5 Input dock
Placeholder: *"Tanyakan tentang data pembangkit, SOP, atau status pekerjaan…"* — bukan "Ask WIRA anything" generik. Tombol kirim adalah teks **"Kirim"** di ujung kanan dock, berubah ke `signal` solid saat ada teks di input, redup saat kosong.

### 8.6 Disclaimer
Satu baris kecil, statis, di bawah input dock, mono 13px, `mist/60`:
```
WIRA dapat keliru — verifikasi ke sumber sebelum digunakan untuk keputusan operasional.
```
Selalu terlihat, tidak collapsible, tidak dismissible — ini bukan "tips" yang bisa ditutup.

---

## 9. Suara & Nada Tulisan

Mengikuti prinsip: kata-kata dalam UI ada untuk membantu, bukan berbasa-basi.

- Kalimat aktif: tombol "Kirim" mengirim; sesudah dikirim, tidak perlu toast "Terkirim!" — perubahan status pada input dock (Bagian 6) sudah cukup memberi umpan balik.
- Tidak ada sapaan basa-basi ("Halo! Ada yang bisa saya bantu?"). Langsung ke undangan bertindak (Bagian 8.1).
- Pesan gagal/diblokir menyatakan apa yang terjadi apa adanya, tanpa "Maaf" berulang.
- Bahasa Indonesia formal-teknis, bukan casual — audiens adalah engineer/operator, bukan konsumen umum.

---

## 10. Implementasi — Tailwind Token

```js
// tailwind.config.js — extend
theme: {
  extend: {
    colors: {
      void: '#0A0E1F',
      'deep-current': '#14245A',
      ember: '#5A1228',
      signal: '#3E5CE0',
      mist: '#EEEAE4',
    },
    fontFamily: {
      sans: ['General Sans', 'sans-serif'],
      mono: ['IBM Plex Mono', 'monospace'],
    },
    borderRadius: {
      shell: '4px',
      dock: '20px',
    },
    backgroundImage: {
      'wira-gradient': 'linear-gradient(160deg, #0A0E1F 0%, #14245A 45%, #5A1228 100%)',
    },
  },
}
```

Kelas glass panel sebagai utility custom:
```css
.glass {
  @apply bg-white/[0.06] backdrop-blur-xl backdrop-saturate-150 border border-white/[0.14] rounded-dock;
  box-shadow: 0 8px 32px rgba(10,14,31,0.35);
}
```

---

## 11. Aksesibilitas & Responsif

- Kontras teks `mist` (#EEEAE4) di atas `void`/`deep-current` memenuhi WCAG AA untuk body text; di atas `ember` pada titik gradasi paling terang, verifikasi ulang kontras saat implementasi — turunkan opacity gradient di area teks bila perlu.
- Focus ring keyboard: outline 2px `signal`, solid, tidak memakai motion border (Bagian 6) sebagai satu-satunya indikator fokus.
- `prefers-reduced-motion` dihormati penuh (Bagian 6).
- Mobile: sidebar jadi drawer yang ditarik dari kiri (bukan hilang), input dock tetap fixed di bawah, lebar baca jawaban menyesuaikan penuh (tanpa batas 72 karakter di layar sempit).

---

## 12. Catatan Self-Critique

Satu tempat paling berani di desain ini adalah outline bergerak pada input dock (Bagian 6) — semua elemen lain sengaja dibuat diam dan tenang di sekitarnya. Jika saat implementasi terasa masih ada elemen lain yang "ramai" (hover state berlebihan, shadow bertumpuk, dsb.), itu tanda untuk dikurangi, bukan ditambah.
