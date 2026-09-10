import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { MessageSquare, Plus, Edit2, Trash2, Users, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { toast } from 'sonner';

// WIRA Nusantara Logo Component
function WiraLogo({ size = 10 }: { size?: number }) {
    return (
        <div className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-md border border-white/20`}>
            <img
                src="/images/WhatsApp_Image_2026-09-08_at_07.25.54-removebg-preview.png"
                alt="WIRA Nusantara"
                className="h-full w-full object-contain p-0.5"
            />
        </div>
    );
}

interface Conversation {
    id: number;
    title: string;
    updated_at: string;
    last_message?: string;
}

export function AppSidebar() {
    const { conversations = [], activeConversation } = usePage().props as unknown as {
        conversations?: Conversation[];
        activeConversation?: Conversation;
    };

    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const [editingConvId, setEditingConvId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Custom confirm delete modal state
    const [deleteTargetConv, setDeleteTargetConv] = useState<{ id: number; title: string } | null>(null);
    const [isDeletingConv, setIsDeletingConv] = useState(false);

    const handleNewConversation = async () => {
        try {
            const res = await fetch('/wira/chat/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            const data = await res.json();
            if (data.conversation) {
                router.get('/dashboard', { conversation_id: data.conversation.id });
            }
        } catch (e) {
            toast.error('Gagal membuat percakapan baru');
        }
    };

    const handleSelectConversation = (id: number) => {
        router.get('/dashboard', { conversation_id: id }, { preserveState: true, replace: true });
    };

    const handleDeleteClick = (e: React.MouseEvent, conv: Conversation) => {
        e.stopPropagation();
        setDeleteTargetConv({ id: conv.id, title: conv.title });
    };

    const executeDeleteConv = () => {
        if (!deleteTargetConv) return;
        setIsDeletingConv(true);

        router.delete(`/wira/chat/conversations/${deleteTargetConv.id}`, {
            onSuccess: () => {
                toast.success('Percakapan berhasil dihapus', {
                    description: `"${deleteTargetConv.title}" telah dihapus dari riwayat.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
                setDeleteTargetConv(null);
            },
            onError: () => {
                toast.error('Gagal menghapus percakapan', {
                    description: 'Terjadi kesalahan saat menghapus percakapan. Coba lagi.',
                });
            },
            onFinish: () => setIsDeletingConv(false),
        });
    };

    const handleSaveTitle = (id: number) => {
        if (!editingTitle.trim()) return;
        router.patch(`/wira/chat/conversations/${id}/title`, {
            title: editingTitle.trim(),
        }, {
            onSuccess: () => {
                setEditingConvId(null);
                toast.success('Judul percakapan diperbarui', {
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                });
            },
            onError: () => {
                toast.error('Gagal memperbarui judul percakapan');
            },
        });
    };

    return (
        <Sidebar collapsible="icon">
            {/* HEADER */}
            <SidebarHeader className="gap-0 p-0">
                <div className={`flex items-center gap-3 px-3 py-3 border-b border-sidebar-border ${isCollapsed ? 'justify-center px-2' : ''}`}>
                    <WiraLogo />
                    {!isCollapsed && (
                        <div className="flex flex-col leading-tight min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-extrabold text-sidebar-foreground tracking-tight">WIRA</span>
                                <span className="rounded-md bg-[#FFD200] px-1.5 py-0.5 text-[8px] font-black text-[#1a3c55] leading-none uppercase tracking-wide">AI</span>
                            </div>
                            <span className="text-[10px] text-sidebar-foreground/50 font-medium truncate">PLN NP UP Kendari</span>
                        </div>
                    )}
                </div>

                {!isCollapsed ? (
                    <div className="px-3 py-2.5">
                        <button
                            onClick={handleNewConversation}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD200] px-4 py-2.5 text-xs font-bold text-[#1a3c55] shadow-md transition-all hover:bg-[#FFE043] hover:shadow-lg active:scale-[0.98]"
                        >
                            <Plus className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Percakapan Baru</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center py-2">
                        <button
                            onClick={handleNewConversation}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD200] text-[#2F6C8E] hover:bg-[#FFE043] shadow"
                            title="Percakapan Baru"
                        >
                            <Plus className="h-4 w-4 stroke-[3]" />
                        </button>
                    </div>
                )}
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent className="custom-scrollbar px-2 py-1">
                <SidebarGroup className="p-0">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">
                            Riwayat Percakapan WIRA
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {conversations.length === 0 ? (
                            !isCollapsed && (
                                <div className="px-3 py-6 text-center">
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent/50">
                                        <MessageSquare className="h-4 w-4 text-sidebar-foreground/30" />
                                    </div>
                                    <p className="text-[11px] text-sidebar-foreground/40 leading-relaxed">Belum ada percakapan.<br />Mulai dengan klik tombol di atas.</p>
                                </div>
                            )
                        ) : (
                            conversations.map((conv) => {
                                const isActive = activeConversation?.id === conv.id;
                                const isEditing = editingConvId === conv.id;

                                return (
                                    <SidebarMenuItem key={conv.id}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            onClick={() => handleSelectConversation(conv.id)}
                                            className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                                                isActive
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm border border-[#FFD200]/20'
                                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                            }`}
                                            tooltip={conv.title}
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#FFD200]' : 'text-sidebar-foreground/40'}`} />
                                                {!isCollapsed && (
                                                    isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editingTitle}
                                                            onChange={(e) => setEditingTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveTitle(conv.id);
                                                                if (e.key === 'Escape') setEditingConvId(null);
                                                            }}
                                                            onBlur={() => handleSaveTitle(conv.id)}
                                                            autoFocus
                                                            className="w-full bg-black/30 text-white rounded px-1.5 py-0.5 text-xs border border-white/30 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <span className="truncate">{conv.title}</span>
                                                    )
                                                )}
                                            </div>

                                            {!isCollapsed && !isEditing && (
                                                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingConvId(conv.id);
                                                            setEditingTitle(conv.title);
                                                        }}
                                                        className="rounded p-1 hover:text-[#FFD200] text-sidebar-foreground/50 transition-colors"
                                                        title="Ubah Nama"
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(e, conv)}
                                                        className="rounded p-1 hover:text-red-400 text-sidebar-foreground/50 transition-colors"
                                                        title="Hapus Percakapan"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })
                        )}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup className="p-0 mt-2">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
                            Integrasi
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => router.get('/wira/whatsapp-groups')}
                                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-all"
                                tooltip="Grup WhatsApp PLN"
                            >
                                <Users className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                {!isCollapsed && <span>Grup WhatsApp PLN</span>}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="p-2 border-t border-sidebar-border">
                <NavUser />
            </SidebarFooter>

            {/* MODAL: KONFIRMASI HAPUS PERCAKAPAN */}
            {deleteTargetConv && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
                >
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center gap-3 mb-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900">
                                    <AlertTriangle className="h-7 w-7 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">Hapus Percakapan?</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Percakapan <span className="font-bold text-gray-800 dark:text-gray-200">"{deleteTargetConv.title}"</span> dan seluruh isi riwayat pesan di dalamnya akan dihapus secara permanen.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeleteTargetConv(null)}
                                    disabled={isDeletingConv}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeDeleteConv}
                                    disabled={isDeletingConv}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md disabled:opacity-70"
                                >
                                    {isDeletingConv ? (
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
            )}
        </Sidebar>
    );
}
