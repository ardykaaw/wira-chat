import React, { useState, useEffect } from 'react';
import { QrCode, Wifi, WifiOff, CheckCircle2, AlertTriangle, Phone, RefreshCw, LogOut, X, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsappGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: (status: { connected: boolean; phone?: string; name?: string }) => void;
}

interface GatewayStatus {
    online: boolean;
    status: 'initializing' | 'qr_ready' | 'authenticated' | 'ready' | 'disconnected' | 'offline';
    connected: boolean;
    qr?: string | null;
    info?: {
        phone?: string;
        name?: string;
        platform?: string;
    } | null;
    message?: string;
}

export default function WhatsappGatewayModal({ isOpen, onClose, onStatusChange }: WhatsappGatewayModalProps) {
    const [status, setStatus] = useState<GatewayStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/wira/whatsapp/status', {
                headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
                const data: GatewayStatus = await res.json();
                setStatus(data);
                if (onStatusChange) {
                    onStatusChange({
                        connected: data.connected,
                        phone: data.info?.phone,
                        name: data.info?.name,
                    });
                }
            }
        } catch (e) {
            setStatus({
                online: false,
                status: 'offline',
                connected: false,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        fetchStatus();

        // Poll every 3 seconds while modal is open
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const res = await fetch('/wira/whatsapp/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Sesi WhatsApp berhasil diputuskan', {
                    description: 'Silakan scan ulang QR Code untuk menghubungkan nomor baru.',
                });
                fetchStatus();
            } else {
                toast.error('Gagal logout WhatsApp', { description: data.error || data.message });
            }
        } catch (e) {
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A2130] shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header top colored border */}
                <div className={`h-1.5 w-full ${
                    status?.connected 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                        : status?.status === 'qr_ready'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`} />

                <div className="p-6">
                    {/* Title */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${
                                status?.connected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            }`}>
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900 dark:text-white">Koneksi WhatsApp Gateway</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Node.js Gateway (whatsapp-web.js)</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="py-5">
                        {isLoading && !status ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-[#2F6C8E]" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Memeriksa status gateway...</p>
                            </div>
                        ) : status?.connected ? (
                            /* State 1: Connected */
                            <div className="text-center space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 shadow-inner">
                                    <CheckCircle2 className="h-9 w-9" />
                                </div>

                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 mb-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        WhatsApp Terhubung Aktif
                                    </span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                        {status.info?.name || 'Nomor Pribadi / Operasional'}
                                    </h4>
                                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                                        +{status.info?.phone}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-left text-xs text-gray-600 dark:text-gray-300">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Status Layanan:</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Pesan broadcast dari WIRA Assistant akan dikirimkan langsung melalui nomor WhatsApp ini ke grup-grup yang telah didaftarkan.
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memutuskan Sesi...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="h-4 w-4" />
                                            Putuskan Sesi WhatsApp
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : status?.status === 'qr_ready' && status.qr ? (
                            /* State 2: QR Ready for Scanning */
                            <div className="text-center space-y-4">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 mb-2">
                                        <QrCode className="h-3.5 w-3.5" />
                                        Scan QR Code untuk Menghubungkan
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Gunakan WhatsApp di HP Anda untuk memindai kode berikut
                                    </p>
                                </div>

                                {/* QR Code Image container */}
                                <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200 dark:border-gray-600 inline-block">
                                    <img
                                        src={status.qr}
                                        alt="WhatsApp QR Code"
                                        className="w-56 h-56 mx-auto rounded-xl"
                                    />
                                </div>

                                {/* Instructions */}
                                <div className="text-left text-xs bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5 text-gray-600 dark:text-gray-300">
                                    <p className="font-bold text-gray-800 dark:text-gray-200">Langkah scan di HP:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
                                        <li>Buka WhatsApp di ponsel Anda</li>
                                        <li>Ketuk <b>Titik Tiga ⋮</b> (Android) atau <b>Pengaturan ⚙️</b> (iPhone)</li>
                                        <li>Pilih <b>Perangkat Tertaut</b> &gt; <b>Tautkan Perangkat</b></li>
                                        <li>Arahkan kamera ke QR Code di atas</li>
                                    </ol>
                                </div>

                                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                                    <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                                    <span>Menunggu pemindaian... otomatis terhubung saat di-scan</span>
                                </div>
                            </div>
                        ) : (
                            /* State 3: Offline / Initializing */
                            <div className="text-center space-y-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-500">
                                    <WifiOff className="h-7 w-7" />
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                        {status?.status === 'initializing' ? 'Menyiapkan WhatsApp Gateway...' : 'WhatsApp Gateway Belum Aktif'}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                                        {status?.status === 'initializing' 
                                            ? 'Browser Puppeteer sedang dimuat. QR code akan muncul dalam beberapa detik...' 
                                            : 'Service Node.js di port 3001 belum merespons.'}
                                    </p>
                                </div>

                                {status?.status !== 'initializing' && (
                                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-left font-mono text-[11px] text-gray-700 dark:text-gray-300">
                                        <p className="text-[10px] text-gray-400 font-sans mb-1 font-semibold">Jalankan di terminal:</p>
                                        <code className="text-[#2F6C8E] dark:text-[#5297C1] select-all">
                                            cd whatsapp-gateway && npm start
                                        </code>
                                    </div>
                                )}

                                <button
                                    onClick={fetchStatus}
                                    className="flex items-center justify-center gap-2 px-4 py-2 mx-auto rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Cek Status Ulang
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
