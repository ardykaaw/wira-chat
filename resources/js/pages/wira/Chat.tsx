import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    Send, Paperclip, Copy, Share2, X, 
    Users, CheckSquare, Square, Activity, Wrench, ShieldAlert,
    FileText, Image, File, AlertTriangle, CheckCircle2, Loader2, Trash2, Smartphone
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { toast, Toaster } from 'sonner';
import WhatsappGatewayModal from '@/components/wira/WhatsappGatewayModal';

function WiraAvatar() {
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden shadow-sm border border-white/10 bg-white">
            <img
                src="/images/WhatsApp_Image_2026-09-08_at_07.25.54-removebg-preview.png"
                alt="WIRA"
                className="h-full w-full object-contain p-0.5"
            />
        </div>
    );
}

// Lightweight Markdown & Table Parser
function MarkdownContent({ content }: { content: string }) {
    const lines = content.split('\n');
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
            if (trimmed.includes('---')) {
                return;
            }
            if (!inTable) {
                inTable = true;
                tableHeader = cells;
            } else {
                tableRows.push(cells);
            }
            return;
        } else if (inTable) {
            elements.push(
                <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold">
                            <tr>
                                {tableHeader.map((h, i) => (
                                    <th key={i} className="px-3 py-2 text-left">{renderFormattedText(h)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            {tableRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-3 py-2 text-gray-800 dark:text-gray-300">{renderFormattedText(cell)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            inTable = false;
            tableHeader = [];
            tableRows = [];
        }

        if (trimmed.startsWith('### ')) {
            elements.push(<h3 key={idx} className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-1.5">{renderFormattedText(trimmed.replace('### ', ''))}</h3>);
        } else if (trimmed.startsWith('## ')) {
            elements.push(<h2 key={idx} className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">{renderFormattedText(trimmed.replace('## ', ''))}</h2>);
        } else if (trimmed.startsWith('> ')) {
            elements.push(
                <blockquote key={idx} className="border-l-4 border-[#2F6C8E] bg-[#2F6C8E]/10 p-2.5 my-2 rounded-r-lg text-xs italic text-gray-800 dark:text-gray-200">
                    {renderFormattedText(trimmed.replace('> ', ''))}
                </blockquote>
            );
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
                <li key={idx} className="ml-4 list-disc text-xs text-gray-800 dark:text-gray-200 my-0.5">
                    {renderFormattedText(trimmed.substring(2))}
                </li>
            );
        } else if (/^\d+\.\s/.test(trimmed)) {
            elements.push(
                <li key={idx} className="ml-4 list-decimal text-xs text-gray-800 dark:text-gray-200 my-0.5">
                    {renderFormattedText(trimmed.replace(/^\d+\.\s/, ''))}
                </li>
            );
        } else if (trimmed === '') {
            elements.push(<div key={idx} className="h-2" />);
        } else {
            elements.push(<p key={idx} className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 my-1">{renderFormattedText(line)}</p>);
        }
    });

    if (inTable) {
        elements.push(
            <div key="table-end" className="my-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold">
                        <tr>
                            {tableHeader.map((h, i) => (
                                <th key={i} className="px-3 py-2 text-left">{renderFormattedText(h)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {tableRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-3 py-2 text-gray-800 dark:text-gray-300">{renderFormattedText(cell)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <div>{elements}</div>;
}

function renderFormattedText(text: string) {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-[11px] text-pink-600 dark:text-pink-400 border border-gray-200 dark:border-gray-700">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

interface Conversation {
    id: number;
    title: string;
    updated_at: string;
    last_message?: string;
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_type?: string;
    created_at?: string;
}

interface WhatsappGroup {
    id: number;
    name: string;
    group_id: string;
    category: string;
    is_active: boolean;
}

interface Props {
    conversations: Conversation[];
    activeConversation?: Conversation;
    messages: Message[];
    whatsappGroups: WhatsappGroup[];
}

export default function Chat({ activeConversation: initialActive, messages: initialMessages, whatsappGroups: initialGroups }: Props) {

    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [whatsappGroups, setWhatsappGroups] = useState<WhatsappGroup[]>(initialGroups || []);
    
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // WhatsApp Modal state
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);
    const [waMessageContent, setWaMessageContent] = useState('');
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
    const [isSendingWa, setIsSendingWa] = useState(false);

    // Data Master WA Groups Management Modal state
    const [isGroupManageOpen, setIsGroupManageOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupId, setNewGroupId] = useState('');
    const [newGroupCategory, setNewGroupCategory] = useState('Operasi');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File attachment state
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    // WhatsApp Gateway connection state & modal
    const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
    const [gatewayStatus, setGatewayStatus] = useState<{ connected: boolean; phone?: string; name?: string }>({ connected: false });

    // Delete confirm modal (replaces browser confirm)
    const [deleteGroupTarget, setDeleteGroupTarget] = useState<{ id: number; name: string } | null>(null);
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);

    useEffect(() => {
        // Fetch WhatsApp Gateway status on mount
        fetch('/wira/whatsapp/status', { headers: { 'Accept': 'application/json' } })
            .then((r) => r.json())
            .then((data) => {
                if (data.connected) {
                    setGatewayStatus({
                        connected: true,
                        phone: data.info?.phone,
                        name: data.info?.name,
                    });
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        if (initialGroups) {
            setWhatsappGroups(initialGroups);
        }
    }, [initialGroups]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Handle send message
    const handleSendMessage = async (customPrompt?: string) => {
        const textToSend = customPrompt !== undefined ? customPrompt : inputMessage;
        if ((!textToSend.trim() && !attachedFile) || isLoading) return;

        let currentConversation = initialActive;

        // If no active conversation, create one first
        if (!currentConversation) {
            try {
                const res = await fetch('/wira/chat/conversations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                });
                const data = await res.json();
                currentConversation = data.conversation;
            } catch (e) {
                toast.error('Gagal memulai percakapan', { description: 'Periksa koneksi dan coba lagi.' });
                return;
            }
        }

        const effectiveText = textToSend.trim() || (attachedFile ? `Tolong analisis file terlampir: ${attachedFile.name}` : '');
        const fileToSend = attachedFile;
        const tempId = Date.now();

        // Local object URL for instant preview if image
        let localPreviewUrl: string | undefined;
        if (fileToSend && fileToSend.type.startsWith('image/')) {
            try {
                localPreviewUrl = URL.createObjectURL(fileToSend);
            } catch (e) {}
        }

        const userMsg: Message = {
            id: tempId,
            role: 'user',
            content: effectiveText,
            attachment_url: localPreviewUrl,
            attachment_name: fileToSend?.name,
            attachment_type: fileToSend ? (fileToSend.type.startsWith('image/') ? 'image' : 'file') : undefined,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputMessage('');
        setAttachedFile(null);
        setIsLoading(true);

        try {
            let body: BodyInit;
            let headers: HeadersInit = {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                'Accept': 'application/json',
            };

            if (fileToSend) {
                const formData = new FormData();
                formData.append('message', effectiveText);
                formData.append('file', fileToSend);
                body = formData;
            } else {
                headers = { ...headers, 'Content-Type': 'application/json' };
                body = JSON.stringify({ message: effectiveText });
            }

            const res = await fetch(`/wira/chat/conversations/${currentConversation!.id}/messages`, {
                method: 'POST',
                headers,
                body,
            });
            const data = await res.json();
            
            if (data.user_message && data.ai_message) {
                setMessages((prev) => [
                    ...prev.filter(m => m.id !== tempId),
                    data.user_message,
                    data.ai_message,
                ]);
            } else if (data.ai_message) {
                setMessages((prev) => [...prev, data.ai_message]);
            } else if (data.message) {
                toast.error('Gagal memproses pesan', { description: data.message });
            }
        } catch (e) {
            toast.error('Koneksi ke WIRA terputus', { description: 'Terjadi kesalahan jaringan. Coba kirim ulang.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle file attachment
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error('Ukuran file terlalu besar', {
                description: `Maks ${maxSizeMB}MB. File kamu: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
            });
            return;
        }
        setAttachedFile(file);
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    // Get file icon based on type
    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image className="h-3.5 w-3.5" />;
        if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text')) return <FileText className="h-3.5 w-3.5" />;
        return <File className="h-3.5 w-3.5" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    // Handle open WA modal
    const handleOpenWaModal = (content: string) => {
        setWaMessageContent(content);
        setSelectedGroups(whatsappGroups.map(g => g.id));
        setIsWaModalOpen(true);
    };

    // Handle send WA
    const handleSendWa = async () => {
        if (selectedGroups.length === 0) {
            toast.error('Belum ada grup dipilih', {
                description: 'Pilih minimal satu grup WhatsApp sebagai tujuan.',
                icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
            });
            return;
        }

        setIsSendingWa(true);
        try {
            const res = await fetch('/wira/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    message: waMessageContent,
                    group_ids: selectedGroups,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const sent = data.summary?.sent ?? selectedGroups.length;
                const total = data.summary?.total ?? selectedGroups.length;
                toast.success(`Pesan terkirim ke ${sent}/${total} grup!`, {
                    description: 'Broadcast WhatsApp PLN berhasil dikirim.',
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                    duration: 5000,
                });
                setIsWaModalOpen(false);
            } else {
                toast.error('Gagal mengirim broadcast', {
                    description: data.message || 'Pastikan WhatsApp Gateway sudah berjalan di terminal.',
                    duration: 6000,
                });
            }
        } catch (e) {
            toast.error('Koneksi ke Gateway gagal', {
                description: 'Jalankan: cd whatsapp-gateway && node index.js',
                duration: 8000,
            });
        } finally {
            setIsSendingWa(false);
        }
    };

    // Add WA group (Data Master)
    const handleAddWaGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName || !newGroupId) return;

        router.post('/wira/whatsapp-groups', {
            name: newGroupName,
            group_id: newGroupId,
            category: newGroupCategory,
            is_active: true,
        }, {
            onSuccess: (page: any) => {
                setWhatsappGroups(page.props.whatsappGroups || []);
                setNewGroupName('');
                setNewGroupId('');
                toast.success('Grup WhatsApp berhasil ditambahkan', {
                    description: `"${newGroupName}" kini dapat menerima broadcast.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
            },
            onError: () => {
                toast.error('Gagal menambahkan grup', { description: 'Coba lagi beberapa saat.' });
            },
        });
    };

    // Delete WA group — gunakan custom confirm modal
    const handleDeleteWaGroup = (id: number, name: string) => {
        setDeleteGroupTarget({ id, name });
    };

    const executeDeleteWaGroup = () => {
        if (!deleteGroupTarget) return;
        setIsDeletingGroup(true);
        router.delete(`/wira/whatsapp-groups/${deleteGroupTarget.id}`, {
            onSuccess: () => {
                setWhatsappGroups(whatsappGroups.filter(g => g.id !== deleteGroupTarget.id));
                toast.success('Grup berhasil dihapus', {
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
                setDeleteGroupTarget(null);
            },
            onError: () => {
                toast.error('Gagal menghapus grup');
            },
            onFinish: () => setIsDeletingGroup(false),
        });
    };

    // Copy to clipboard
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Teks berhasil disalin!', {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            duration: 2000,
        });
    };

    return (
        <>
            <Head title="WIRA Assistant — PLN NP UP Kendari" />
            <Toaster
                position="top-right"
                toastOptions={{ style: { borderRadius: '14px', fontSize: '13px' } }}
            />

            <div className="flex flex-col h-full flex-1 bg-white dark:bg-[#1A2130] relative overflow-hidden">

                {/* Top header bar with sidebar trigger */}
                <div className="h-12 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 flex items-center justify-between bg-white dark:bg-[#1A2130] shrink-0 z-10">
                    <div className="flex items-center gap-2.5">
                        <SidebarTrigger className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
                        <div className="hidden sm:block w-px h-4 bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">WIRA</span>
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500">Nusantara</span>
                            <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                AI Aktif
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* WhatsApp Gateway Status Button */}
                        <button
                            onClick={() => setIsGatewayModalOpen(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                gatewayStatus.connected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                            }`}
                            title="Koneksi WhatsApp Gateway (Node.js)"
                        >
                            <span className={`h-2 w-2 rounded-full ${gatewayStatus.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="hidden sm:inline">
                                {gatewayStatus.connected
                                    ? (gatewayStatus.phone ? `WA: +${gatewayStatus.phone}` : 'WA Terhubung')
                                    : 'Scan QR WhatsApp'}
                            </span>
                            <span className="sm:hidden">WA</span>
                        </button>

                        <button
                            onClick={() => router.get('/wira/whatsapp-groups')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition-colors shadow-sm"
                        >
                            <Users className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Grup WhatsApp</span>
                            <span className="sm:hidden">Grup</span>
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                    
                    {/* Welcome State when no messages */}
                    {messages.length === 0 && (
                        <div className="max-w-2xl mx-auto text-center py-8">
                            {/* Logo WIRA besar */}
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 mb-5">
                                <img
                                    src="/images/WhatsApp_Image_2026-09-08_at_07.25.54-removebg-preview.png"
                                    alt="WIRA"
                                    className="h-full w-full object-contain p-1.5"
                                />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                                Halo! Saya <span className="text-[#2F6C8E] dark:text-[#5297C1]">WIRA</span>
                            </h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">WhatsApp Information &amp; Resource Assistant</p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                                Tanyakan kondisi mesin, telemetry real-time, histori pemeliharaan, atau minta saya mengirim laporan ke grup WhatsApp PLN.
                            </p>

                            {/* 4 Suggestion Prompt Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                <button
                                    onClick={() => handleSendMessage("Bagaimana status operasi mesin unit 1 hari ini?")}
                                    className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-[#2F6C8E] hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#2F6C8E] dark:text-[#5297C1]">
                                        <Activity className="h-4 w-4" />
                                        <span>Status Operasi</span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                        "Bagaimana status operasi mesin unit 1 hari ini?"
                                    </p>
                                </button>

                                <button
                                    onClick={() => handleSendMessage("Tampilkan histori maintenance mesin PLTD X bulan ini")}
                                    className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-[#2F6C8E] hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                        <Wrench className="h-4 w-4" />
                                        <span>Histori Maintenance</span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                        "Tampilkan histori maintenance mesin PLTD X bulan ini"
                                    </p>
                                </button>

                                <button
                                    onClick={() => handleSendMessage("Mesin mana saja yang sedang alarm/gangguan?")}
                                    className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-[#2F6C8E] hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>Monitoring Alarm</span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                        "Mesin mana saja yang sedang alarm/gangguan?"
                                    </p>
                                </button>

                                <button
                                    onClick={() => handleSendMessage("Kirim ringkasan kinerja minggu ini ke grup WA Operasi")}
                                    className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-[#2F6C8E] hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <Share2 className="h-4 w-4" />
                                        <span>WhatsApp Broadcast</span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                        "Kirim ringkasan kinerja minggu ini ke grup WA Operasi"
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Message list */}
                    {messages.map((msg) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                            >
                                {!isUser && <WiraAvatar />}
                                
                                <div className="group relative">
                                    <div
                                        className={`rounded-2xl p-4 shadow-sm text-xs ${
                                            isUser
                                                ? 'bg-[#2F6C8E] text-white rounded-tr-none'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-none'
                                        }`}
                                    >
                                        {/* Attachment preview in message bubble */}
                                        {msg.attachment_url && (
                                            <div className="mb-2.5">
                                                {msg.attachment_type === 'image' ? (
                                                    <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-white/20 dark:border-gray-700 max-w-xs group/img">
                                                        <img
                                                            src={msg.attachment_url}
                                                            alt={msg.attachment_name || 'Lampiran'}
                                                            className="max-h-56 w-auto rounded-lg object-cover group-hover/img:scale-105 transition-transform duration-200"
                                                        />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={msg.attachment_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download={msg.attachment_name}
                                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                            isUser
                                                                ? 'bg-white/15 hover:bg-white/25 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                                                        }`}
                                                    >
                                                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate max-w-[200px]">{msg.attachment_name || 'Lihat Dokumen'}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        <MarkdownContent content={msg.content} />
                                    </div>

                                    {/* Action buttons for AI response */}
                                    {!isUser && (
                                        <div className="flex items-center gap-2 mt-1.5 ml-1 text-gray-400 text-[11px]">
                                            <button
                                                onClick={() => handleCopy(msg.content)}
                                                className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-white transition-colors"
                                                title="Salin Teks"
                                            >
                                                <Copy className="h-3 w-3" />
                                                <span>Salin</span>
                                            </button>

                                            <span className="text-gray-300 dark:text-gray-700">•</span>

                                            <button
                                                onClick={() => handleOpenWaModal(msg.content)}
                                                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                                title="Kirim Pesan Ini ke WhatsApp Group"
                                            >
                                                <Share2 className="h-3 w-3" />
                                                <span>Kirim ke WhatsApp</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing / Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-3 max-w-xl mr-auto">
                            <WiraAvatar />
                            <div className="rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">WIRA sedang memproses</span>
                                    <span className="flex gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2F6C8E] animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2F6C8E] animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2F6C8E] animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Box Area (Fixed Bottom) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A2130] shrink-0">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative flex items-end gap-2 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-sm focus-within:border-[#2F6C8E] transition-all">
                            
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp"
                                onChange={handleFileChange}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-2 rounded-lg transition-colors shrink-0 ${
                                    attachedFile
                                        ? 'text-[#2F6C8E] bg-[#2F6C8E]/10'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                title="Lampirkan file (PDF, gambar, dokumen)"
                            >
                                <Paperclip className="h-4 w-4" />
                            </button>

                            <textarea
                                ref={textareaRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ketik pertanyaan seputar mesin pembangkit UP Kendari..."
                                rows={1}
                                className="flex-1 bg-transparent border-none resize-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none max-h-32 py-1.5"
                            />

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={(!inputMessage.trim() && !attachedFile) || isLoading}
                                className="p-2.5 rounded-xl bg-[#2F6C8E] text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3E7FA3] transition-all shadow-sm shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>

                        {/* File attachment preview chip */}
                        {attachedFile && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2F6C8E]/10 border border-[#2F6C8E]/30 text-[#2F6C8E] dark:text-[#5297C1] text-xs font-semibold max-w-xs">
                                    {getFileIcon(attachedFile)}
                                    <span className="truncate">{attachedFile.name}</span>
                                    <span className="text-[10px] text-[#2F6C8E]/70 shrink-0">({formatFileSize(attachedFile.size)})</span>
                                    <button
                                        onClick={() => setAttachedFile(null)}
                                        className="ml-1 p-0.5 rounded hover:bg-[#2F6C8E]/20 transition-colors shrink-0"
                                        title="Hapus lampiran"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            WIRA dapat membuat kesalahan. Selalu verifikasi data penting dengan sistem monitoring PLN.
                        </p>
                    </div>
                </div>
            </div>

            {/* MODAL: KIRIM KE WHATSAPP */}
            {isWaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                <Share2 className="h-5 w-5" />
                                <span>Kirim Informasi ke Grup WhatsApp</span>
                            </div>
                            <button onClick={() => setIsWaModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Preview Message Textarea */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Preview Isi Pesan (Dapat Diedit):
                            </label>
                            <textarea
                                value={waMessageContent}
                                onChange={(e) => setWaMessageContent(e.target.value)}
                                rows={6}
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Select Target WhatsApp Groups */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Pilih Grup WhatsApp Tujuan:
                            </label>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                {whatsappGroups.map((group) => {
                                    const isSelected = selectedGroups.includes(group.id);
                                    return (
                                        <div
                                            key={group.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                                } else {
                                                    setSelectedGroups([...selectedGroups, group.id]);
                                                }
                                            }}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isSelected ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4 text-gray-400" />}
                                                <span>{group.name}</span>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                                {group.category}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setIsWaModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSendWa}
                                disabled={isSendingWa}
                                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
                            >
                                {isSendingWa ? 'Mengirim...' : 'Kirim Sekarang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: KELOLA GRUP WHATSAPP (DATA MASTER) */}
            {isGroupManageOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                            <div className="flex items-center gap-2 text-[#2F6C8E] dark:text-[#5297C1] font-bold text-sm">
                                <Users className="h-5 w-5" />
                                <span>Data Master: Kelola Grup WhatsApp PLN</span>
                            </div>
                            <button onClick={() => setIsGroupManageOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form Tambah Grup Baru */}
                        <form onSubmit={handleAddWaGroup} className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-3">Tambah Grup WhatsApp Baru</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Nama Grup WA"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="ID Grup / Nomor (e.g. 12036...)"
                                    value={newGroupId}
                                    onChange={(e) => setNewGroupId(e.target.value)}
                                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                                    required
                                />
                                <select
                                    value={newGroupCategory}
                                    onChange={(e) => setNewGroupCategory(e.target.value)}
                                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                                >
                                    <option value="Operasi">Operasi</option>
                                    <option value="Manajemen">Manajemen</option>
                                    <option value="Pemeliharaan">Pemeliharaan</option>
                                    <option value="K3 & Safety">K3 & Safety</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-[#2F6C8E] text-white font-bold text-xs rounded-lg hover:bg-[#3E7FA3] transition-colors"
                            >
                                + Simpan Grup Baru
                            </button>
                        </form>

                        {/* List Existing Groups */}
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {whatsappGroups.map((g) => (
                                <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{g.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">ID: {g.group_id} • Kategori: {g.category}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteWaGroup(g.id, g.name)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                        title="Hapus Grup"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: KONFIRMASI HAPUS GRUP (dari kelola grup) */}
            {deleteGroupTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center gap-3 mb-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900">
                                    <AlertTriangle className="h-7 w-7 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">Hapus Grup?</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Grup <span className="font-bold text-gray-800 dark:text-gray-200">"{deleteGroupTarget.name}"</span> akan dihapus secara permanen.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeleteGroupTarget(null)}
                                    disabled={isDeletingGroup}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeDeleteWaGroup}
                                    disabled={isDeletingGroup}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md disabled:opacity-70"
                                >
                                    {isDeletingGroup ? (
                                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />Menghapus...</>
                                    ) : (
                                        <><Trash2 className="h-3.5 w-3.5" />Ya, Hapus</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: KONEKSI WHATSAPP GATEWAY (QR SCAN & STATUS) */}
            <WhatsappGatewayModal
                isOpen={isGatewayModalOpen}
                onClose={() => setIsGatewayModalOpen(false)}
                onStatusChange={(newStatus) => setGatewayStatus(newStatus)}
            />
        </>
    );
}
