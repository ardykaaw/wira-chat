/**
 * WIRA Nusantara — WhatsApp Gateway Service
 * Berbasis whatsapp-web.js (Baileys-like approach via Puppeteer)
 *
 * Cara pakai:
 *   1. npm install
 *   2. node index.js
 *   3. Scan QR Code yang muncul di terminal dengan WhatsApp kamu
 *   4. Service siap di http://localhost:3001
 *
 * API Endpoint:
 *   POST /send         → Kirim pesan ke nomor/grup WA
 *   GET  /status       → Cek status koneksi WA
 *   GET  /health       → Health check
 */

const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:*' }));
app.use(express.json({ limit: '5mb' }));

// ────────────────────────────────────────────────
// WhatsApp Client Setup
// ────────────────────────────────────────────────
let clientStatus = 'initializing'; // initializing | qr_ready | authenticated | ready | disconnected
let currentQrDataUrl = null;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'wira-gateway',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Event: QR Code
client.on('qr', async (qr) => {
    clientStatus = 'qr_ready';
    try {
        currentQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
    } catch (e) {
        console.error('Gagal generate QR DataURL:', e);
    }
    console.log('\n══════════════════════════════════════');
    console.log('  WIRA NUSANTARA — WhatsApp Gateway  ');
    console.log('══════════════════════════════════════');
    console.log('📱 Scan QR Code berikut dengan WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('══════════════════════════════════════\n');
});

// Event: Authenticated
client.on('authenticated', () => {
    clientStatus = 'authenticated';
    console.log('✅ WhatsApp authenticated! Menunggu siap...');
});

// Event: Ready
client.on('ready', () => {
    clientStatus = 'ready';
    currentQrDataUrl = null;
    const info = client.info;
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 WIRA Gateway SIAP!`);
    console.log(`📞 Nomor: ${info.wid.user}`);
    console.log(`👤 Nama:  ${info.pushname}`);
    console.log(`🌐 URL:   http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════\n');
});

// Event: Disconnected
client.on('disconnected', (reason) => {
    clientStatus = 'disconnected';
    currentQrDataUrl = null;
    console.log(`❌ WhatsApp terputus: ${reason}`);
    console.log('🔄 Mencoba reconnect dalam 5 detik...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

// Event: Auth Failure
client.on('auth_failure', (msg) => {
    clientStatus = 'disconnected';
    console.error('❌ Authentication gagal:', msg);
    console.log('💡 Hapus folder .wwebjs_auth/ dan jalankan ulang untuk scan QR baru.');
});

// ────────────────────────────────────────────────
// REST API Routes
// ────────────────────────────────────────────────

/**
 * GET /health
 * Health check — digunakan untuk memastikan service berjalan
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'WIRA WhatsApp Gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /status
 * Cek status koneksi WhatsApp
 */
app.get('/status', (req, res) => {
    const info = clientStatus === 'ready' ? {
        phone: client.info?.wid?.user,
        name: client.info?.pushname,
        platform: client.info?.platform,
    } : null;

    res.json({
        status: clientStatus,
        connected: clientStatus === 'ready',
        qr: clientStatus === 'qr_ready' ? currentQrDataUrl : null,
        info,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /logout
 * Putuskan sesi WhatsApp
 */
app.post('/logout', async (req, res) => {
    try {
        if (clientStatus === 'ready') {
            await client.logout();
        }
        clientStatus = 'disconnected';
        currentQrDataUrl = null;
        setTimeout(() => {
            client.initialize();
        }, 1500);
        return res.json({ success: true, message: 'WhatsApp berhasil logout. Siap scan ulang.' });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /send
 * Kirim pesan WhatsApp
 * 
 * Body:
 *   to      {string}  - Nomor/ID tujuan. Format:
 *                       Nomor biasa: "628123456789@c.us"
 *                       Grup WA:     "1203685342-1619123456@g.us"
 *   message {string}  - Isi pesan (mendukung *bold*, _italic_)
 * 
 * Response:
 *   { success: true, messageId: "xxx" }
 *   { success: false, error: "..." }
 */
app.post('/send', async (req, res) => {
    const { to, message } = req.body;

    // Validasi input
    if (!to || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Parameter "to" dan "message" wajib diisi.' 
        });
    }

    // Cek apakah WA sudah ready
    if (clientStatus !== 'ready') {
        return res.status(503).json({ 
            success: false, 
            error: `WhatsApp belum siap. Status saat ini: "${clientStatus}". Pastikan sudah scan QR Code.`
        });
    }

    try {
        // Format nomor jika perlu (auto-tambah @c.us jika belum ada)
        let chatId = to;
        if (!chatId.includes('@')) {
            // Pastikan format E.164 tanpa tanda +
            chatId = chatId.replace(/^\+/, '').replace(/[^0-9]/g, '');
            chatId = `${chatId}@c.us`;
        }

        // Kirim pesan
        const sentMsg = await client.sendMessage(chatId, message);

        console.log(`📤 Pesan terkirim ke ${chatId} | ID: ${sentMsg.id.id}`);

        return res.json({ 
            success: true, 
            messageId: sentMsg.id.id,
            to: chatId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(`❌ Gagal kirim ke ${to}:`, error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.message,
            to
        });
    }
});

/**
 * POST /send-bulk
 * Kirim pesan ke beberapa nomor/grup sekaligus
 * 
 * Body:
 *   targets  {string[]}  - Array nomor/ID tujuan
 *   message  {string}    - Isi pesan
 *   delay    {number}    - Jeda antar pesan dalam ms (default: 1500)
 */
app.post('/send-bulk', async (req, res) => {
    const { targets, message, delay = 1500 } = req.body;

    if (!targets || !Array.isArray(targets) || targets.length === 0 || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Parameter "targets" (array) dan "message" wajib diisi.' 
        });
    }

    if (clientStatus !== 'ready') {
        return res.status(503).json({ 
            success: false, 
            error: `WhatsApp belum siap. Status: "${clientStatus}"` 
        });
    }

    const results = [];

    for (const to of targets) {
        try {
            let chatId = to;
            if (!chatId.includes('@')) {
                chatId = chatId.replace(/^\+/, '').replace(/[^0-9]/g, '');
                chatId = `${chatId}@c.us`;
            }

            const sentMsg = await client.sendMessage(chatId, message);
            results.push({ to: chatId, success: true, messageId: sentMsg.id.id });
            console.log(`📤 Bulk kirim ke ${chatId} ✓`);

            // Jeda untuk menghindari rate limit
            if (delay > 0) {
                await new Promise(r => setTimeout(r, delay));
            }
        } catch (error) {
            results.push({ to, success: false, error: error.message });
            console.error(`❌ Bulk gagal ke ${to}:`, error.message);
        }
    }

    const successCount = results.filter(r => r.success).length;
    return res.json({
        success: successCount > 0,
        summary: { total: targets.length, sent: successCount, failed: targets.length - successCount },
        results,
        timestamp: new Date().toISOString()
    });
});

// ────────────────────────────────────────────────
// Start Service
// ────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('\n═══════════════════════════════════════════');
    console.log('  🚀 WIRA Nusantara — WhatsApp Gateway   ');
    console.log(`  📡 Listening on http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════');
    console.log('📲 Menginisialisasi WhatsApp client...\n');
});

// Inisialisasi WhatsApp client
client.initialize();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gateway...');
    await client.destroy();
    process.exit(0);
});
