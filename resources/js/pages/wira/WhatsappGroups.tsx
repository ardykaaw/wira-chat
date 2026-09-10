import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Users, ArrowLeft, Plus, Trash2, X, Wifi, AlertTriangle, CheckCircle2, Loader2, Smartphone, QrCode } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import WhatsappGatewayModal from '@/components/wira/WhatsappGatewayModal';

interface Group {
    id: number;
    name: string;
    group_id: string;
    category: string;
    is_active: boolean;
}

// ───────────────────────────────────────────────
// Color mapping per kategori
// ───────────────────────────────────────────────
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Operasi':      { bg: 'bg-blue-50 dark:bg-blue-950/40',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800' },
    'Manajemen':    { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    'Pemeliharaan': { bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800' },
    'Teknologi':    { bg: 'bg-cyan-50 dark:bg-cyan-950/40',     text: 'text-cyan-700 dark:text-cyan-300',     border: 'border-cyan-200 dark:border-cyan-800' },
    'K3 & Safety':  { bg: 'bg-red-50 dark:bg-red-950/40',      text: 'text-red-700 dark:text-red-300',      border: 'border-red-200 dark:border-red-800' },
};
const defaultColor = { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' };

function CategoryBadge({ category }: { category: string }) {
    const colors = categoryColors[category] ?? defaultColor;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
            {category}
        </span>
    );
}

// ───────────────────────────────────────────────
// Premium Confirm Delete Modal
// ───────────────────────────────────────────────
interface ConfirmDeleteModalProps {
    groupName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

function ConfirmDeleteModal({ groupName, onConfirm, onCancel, isDeleting }: ConfirmDeleteModalProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Red accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />

                <div className="p-6">
                    <div className="flex flex-col items-center text-center gap-3 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900">
                            <AlertTriangle className="h-7 w-7 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">Hapus Grup?</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Grup <span className="font-bold text-gray-800 dark:text-gray-200">"{groupName}"</span> akan dihapus secara permanen dari sistem WIRA.
                                Aksi ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md disabled:opacity-70"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Ya, Hapus
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────
export default function WhatsappGroups() {
    const { groups = [] } = usePage().props as unknown as { groups?: Group[] };

    // Add modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [category, setCategory] = useState('Operasi');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Delete modal state
    const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // WhatsApp Gateway modal & status state
    const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
    const [gatewayStatus, setGatewayStatus] = useState<{ connected: boolean; phone?: string; name?: string; status?: string }>({ connected: false });

    useEffect(() => {
        const checkGateway = () => {
            fetch('/wira/whatsapp/status', { headers: { 'Accept': 'application/json' } })
                .then((r) => r.json())
                .then((data) => {
                    setGatewayStatus({
                        connected: data.connected,
                        phone: data.info?.phone,
                        name: data.info?.name,
                        status: data.status,
                    });
                })
                .catch(() => setGatewayStatus({ connected: false, status: 'offline' }));
        };
        checkGateway();
        const interval = setInterval(checkGateway, 4000);
        return () => clearInterval(interval);
    }, []);

    // ── Handle Create ──
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!name.trim()) { setFormError('Nama grup tidak boleh kosong.'); return; }
        if (!groupId.trim()) { setFormError('ID Grup / Nomor tidak boleh kosong.'); return; }

        setIsSubmitting(true);
        router.post('/wira/whatsapp-groups', {
            name: name.trim(),
            group_id: groupId.trim(),
            category,
            is_active: true,
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setName('');
                setGroupId('');
                setCategory('Operasi');
                toast.success('Grup WhatsApp berhasil ditambahkan!', {
                    description: `"${name.trim()}" kini dapat menerima broadcast dari WIRA.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                    duration: 4000,
                });
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as string;
                setFormError(firstError || 'Gagal menyimpan grup. Coba lagi.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    // ── Handle Delete ──
    const confirmDelete = (group: Group) => {
        setDeleteTarget(group);
    };

    const executeDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        router.delete(`/wira/whatsapp-groups/${deleteTarget.id}`, {
            onSuccess: () => {
                toast.success('Grup berhasil dihapus', {
                    description: `"${deleteTarget.name}" telah dihapus dari sistem.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error('Gagal menghapus grup', {
                    description: 'Terjadi kesalahan. Coba lagi beberapa saat.',
                });
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title="Grup WhatsApp — WIRA Nusantara" />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: { borderRadius: '14px', fontSize: '13px' },
                }}
            />

            <div className="flex flex-col h-full flex-1 bg-white dark:bg-[#1A2130] overflow-hidden">
                {/* ── Header ── */}
                <div className="h-12 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 flex items-center justify-between bg-white dark:bg-[#1A2130] shrink-0">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
                        <div className="hidden sm:block w-px h-4 bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Grup WhatsApp PLN</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Status Gateway Pill */}
                        <button
                            onClick={() => setIsGatewayModalOpen(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                gatewayStatus.connected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                            }`}
                            title="Koneksi WhatsApp Gateway"
                        >
                            <span className={`h-2 w-2 rounded-full ${gatewayStatus.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="hidden sm:inline">
                                {gatewayStatus.connected ? (gatewayStatus.phone ? `WA: +${gatewayStatus.phone}` : 'WA Terhubung') : 'Scan QR WA'}
                            </span>
                            <span className="sm:hidden">WA</span>
                        </button>

                        <button
                            onClick={() => router.get('/dashboard')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Kembali ke Chat</span>
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Grup WhatsApp</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Grup yang terdaftar dapat menerima broadcast laporan ringkasan dari WIRA.
                                </p>
                            </div>
                            <button
                                onClick={() => { setFormError(''); setIsAddModalOpen(true); }}
                                className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-4 py-2 text-xs font-bold transition-colors shadow-sm shrink-0 active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Grup Baru</span>
                            </button>
                        </div>

                        {/* WhatsApp Gateway Connection Banner */}
                        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                                    gatewayStatus.connected
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                                        : gatewayStatus.status === 'qr_ready'
                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-800'
                                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800'
                                }`}>
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                                            Koneksi WhatsApp Gateway
                                        </h3>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            gatewayStatus.connected
                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                                : gatewayStatus.status === 'qr_ready'
                                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                                        }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${gatewayStatus.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                            {gatewayStatus.connected
                                                ? `Terhubung (+${gatewayStatus.phone || 'Aktif'})`
                                                : gatewayStatus.status === 'qr_ready'
                                                ? 'Siap Scan QR'
                                                : 'Menyiapkan / Offline'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                        {gatewayStatus.connected
                                            ? `Pesan broadcast akan dikirim melalui nomor WhatsApp ${gatewayStatus.phone ? `+${gatewayStatus.phone}` : ''}.`
                                            : 'Scan QR code dengan WhatsApp di HP Anda untuk menghubungkan akun pengirim pesan.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsGatewayModalOpen(true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                                    gatewayStatus.connected
                                        ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                }`}
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>{gatewayStatus.connected ? 'Kelola Sesi' : 'Scan QR Code'}</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Grup</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">ID / Nomor</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {groups.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-16 text-center">
                                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                                                        <Users className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Belum ada grup terdaftar</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        Klik <span className="font-bold text-emerald-600">+ Tambah Grup Baru</span> untuk menambahkan grup WhatsApp pertama.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            groups.map((group) => (
                                                <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white text-sm">{group.name}</td>
                                                    <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 font-mono text-xs hidden md:table-cell">{group.group_id}</td>
                                                    <td className="px-4 py-3.5">
                                                        <CategoryBadge category={group.category} />
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                                                            group.is_active
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                        }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${group.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                            {group.is_active ? 'Aktif' : 'Non-aktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button
                                                            onClick={() => confirmDelete(group)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            title={`Hapus "${group.name}"`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary stat */}
                        {groups.length > 0 && (
                            <p className="mt-3 text-xs text-gray-400 text-right">
                                {groups.length} grup terdaftar • {groups.filter(g => g.is_active).length} aktif
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MODAL: TAMBAH GRUP ── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Emerald top accent */}
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="font-black text-base text-gray-900 dark:text-white">Tambah Grup WhatsApp</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Daftarkan grup untuk menerima broadcast WIRA</p>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form Error */}
                            {formError && (
                                <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium">{formError}</p>
                                </div>
                            )}

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Nama Grup <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Grup Operasi UP Kendari"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        ID Grup / Nomor WhatsApp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 120363xxxxxxxxxx@g.us atau 62812xxxxx"
                                        value={groupId}
                                        onChange={(e) => setGroupId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                                    />
                                    <p className="mt-1 text-[10px] text-gray-400">Format grup: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">120363xxx@g.us</code> | Format nomor: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">628xxxxxxx</code></p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Kategori</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    >
                                        <option value="Operasi">⚙️ Operasi</option>
                                        <option value="Manajemen">📊 Manajemen</option>
                                        <option value="Pemeliharaan">🔧 Pemeliharaan</option>
                                        <option value="Teknologi">💻 Teknologi</option>
                                        <option value="K3 & Safety">🦺 K3 & Safety</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-3.5 w-3.5" />
                                                Simpan Grup
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: KONFIRMASI HAPUS ── */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    groupName={deleteTarget.name}
                    onConfirm={executeDelete}
                    onCancel={() => setDeleteTarget(null)}
                    isDeleting={isDeleting}
                />
            )}

            {/* ── MODAL: KONEKSI WHATSAPP GATEWAY (QR CODE SCAN) ── */}
            <WhatsappGatewayModal
                isOpen={isGatewayModalOpen}
                onClose={() => setIsGatewayModalOpen(false)}
                onStatusChange={(st) => setGatewayStatus(st)}
            />
        </>
    );
}
