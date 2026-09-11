import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import type { WiraConversation } from '@/types/wira';
import type { Auth } from '@/types/auth';

function formatDate(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date);
}

function csrf(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
}

interface MenuState {
    id: number;
    x: number; // sisi kanan tombol
    y: number; // sisi bawah tombol
    flip: boolean; // buka ke atas bila dekat tepi bawah
}

export function AppSidebar() {
    const page = usePage().props as unknown as {
        conversations?: WiraConversation[];
        activeConversation?: WiraConversation | null;
        auth: Auth;
    };
    const conversations = page.conversations ?? [];
    const activeId = page.activeConversation?.id ?? null;
    const user = page.auth?.user;

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [menu, setMenu] = useState<MenuState | null>(null);

    const pinned = conversations.filter((c) => c.pinned_at);
    const others = conversations.filter((c) => !c.pinned_at);
    const menuConv = menu ? conversations.find((c) => c.id === menu.id) : null;

    const startNew = async () => {
        try {
            const res = await fetch('/wira/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
            });
            const data = (await res.json()) as { conversation: WiraConversation };
            router.get('/dashboard', { conversation_id: data.conversation.id });
        } catch {
            toast.error('Gagal membuat percakapan baru');
        }
    };

    const select = (id: number) => {
        if (editingId === id) return;
        router.get('/dashboard', { conversation_id: id }, { preserveState: true, replace: true });
    };

    const saveTitle = (id: number) => {
        const title = editTitle.trim();
        setEditingId(null);
        if (!title) return;
        router.patch(`/wira/chat/conversations/${id}/title`, { title }, { preserveScroll: true });
    };

    const togglePin = (id: number) => router.patch(`/wira/chat/conversations/${id}/pin`, {}, { preserveScroll: true });
    const archive = (id: number) => router.patch(`/wira/chat/conversations/${id}/archive`, {}, { preserveScroll: true });
    const remove = (id: number) => router.delete(`/wira/chat/conversations/${id}`, { preserveScroll: true });

    const share = async (id: number) => {
        const url = `${window.location.origin}/dashboard?conversation_id=${id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Tautan percakapan disalin');
        } catch {
            toast.error('Gagal menyalin tautan');
        }
    };

    const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
        e.stopPropagation();
        if (menu?.id === id) {
            setMenu(null);
            return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        setMenu({ id, x: r.right, y: r.bottom, flip: r.bottom > window.innerHeight - 220 });
    };

    const runAction = (fn: () => void) => {
        setMenu(null);
        fn();
    };

    const renderItem = (conv: WiraConversation) => {
        const isActive = conv.id === activeId;
        const isEditing = editingId === conv.id;
        const isOpen = menu?.id === conv.id;

        return (
            <li key={conv.id}>
                <div
                    onClick={() => select(conv.id)}
                    className={`flex cursor-pointer items-center gap-1 rounded-shell px-2.5 py-2 transition-colors ${
                        isActive ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                    }`}
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            {isEditing ? (
                                <input
                                    autoFocus
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveTitle(conv.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onBlur={() => saveTitle(conv.id)}
                                    className="w-full rounded-[4px] border border-white/20 bg-black/30 px-1.5 py-0.5 text-[14px] text-mist focus:outline-none"
                                />
                            ) : (
                                <span className={`truncate text-[14px] ${isActive ? 'text-mist' : 'text-mist/75'}`}>
                                    {conv.title}
                                </span>
                            )}
                            <span className="shrink-0 font-mono text-[13px] text-mist/40">{formatDate(conv.updated_at)}</span>
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            type="button"
                            onClick={(e) => openMenu(e, conv.id)}
                            aria-label="Aksi percakapan"
                            className={`shrink-0 rounded-[4px] px-1 text-[15px] leading-none transition-colors hover:text-mist ${
                                isOpen ? 'text-mist' : 'text-mist/50'
                            }`}
                        >
                            ⋯
                        </button>
                    )}
                </div>
            </li>
        );
    };

    const menuItemClass =
        'block w-full rounded-[6px] px-2.5 py-1.5 text-left text-[13px] text-mist/80 transition-colors hover:bg-white/[0.08] hover:text-mist';

    return (
        <Sidebar className="border-r-0">
            <SidebarHeader className="gap-3 px-4 py-4">
                <img
                    src="/logo/logo.png"
                    alt="PLN Nusantara Power — Unit Pembangkitan Kendari"
                    className="mx-auto h-10 w-auto max-w-[200px] object-contain"
                />
                <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[13px] font-medium tracking-tight text-mist">WIRA</span>
                    <span className="font-mono text-[11px] text-mist/40">Asisten</span>
                </div>
                <button
                    type="button"
                    onClick={startNew}
                    className="flex w-full items-center gap-2 rounded-shell px-2.5 py-2 text-left text-[14px] text-mist/80 transition-colors hover:bg-white/[0.06] hover:text-mist"
                >
                    <SquarePen className="h-4 w-4 shrink-0" />
                    Percakapan baru
                </button>
            </SidebarHeader>

            <SidebarContent className="custom-scrollbar px-2 py-2">
                {conversations.length === 0 ? (
                    <p className="px-2 py-3 font-mono text-[13px] leading-relaxed text-mist/40">Belum ada percakapan.</p>
                ) : (
                    <>
                        {pinned.length > 0 && (
                            <>
                                <p className="px-2.5 pb-1 pt-1 font-mono text-[11px] uppercase tracking-wide text-mist/35">
                                    Tersemat
                                </p>
                                <ul className="mb-2 space-y-0.5">{pinned.map(renderItem)}</ul>
                            </>
                        )}
                        {others.length > 0 && (
                            <>
                                {pinned.length > 0 && (
                                    <p className="px-2.5 pb-1 pt-1 font-mono text-[11px] uppercase tracking-wide text-mist/35">
                                        Terbaru
                                    </p>
                                )}
                                <ul className="space-y-0.5">{others.map(renderItem)}</ul>
                            </>
                        )}
                    </>
                )}
            </SidebarContent>

            <SidebarFooter className="gap-2 border-t border-white/10 px-4 py-4">
                {user && (
                    <div className="flex flex-col gap-0.5">
                        <span className="truncate text-[14px] text-mist/85">{user.name}</span>
                        <span className="truncate font-mono text-[12px] text-mist/40">{user.email}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 font-mono text-[13px]">
                    <button
                        type="button"
                        onClick={() => router.get('/settings/profile')}
                        className="text-mist/60 transition-colors hover:text-mist/90"
                    >
                        Pengaturan
                    </button>
                    <span className="text-mist/25">·</span>
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="text-mist/60 transition-colors hover:text-mist/90"
                    >
                        Keluar
                    </button>
                </div>
            </SidebarFooter>

            {/* Menu aksi percakapan (⋯) — dropdown ringan tanpa dependency, fixed agar tidak terpotong */}
            {menu && menuConv && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
                    <div
                        className="fixed z-50 min-w-44 rounded-[10px] border border-white/10 bg-[#2f2f2f] p-1 shadow-xl"
                        style={{
                            left: Math.max(8, menu.x - 176),
                            top: menu.flip ? undefined : menu.y + 4,
                            bottom: menu.flip ? window.innerHeight - menu.y + 4 : undefined,
                        }}
                    >
                        <button type="button" className={menuItemClass} onClick={() => runAction(() => togglePin(menu.id))}>
                            {menuConv.pinned_at ? 'Lepas sematan' : 'Sematkan percakapan'}
                        </button>
                        <button type="button" className={menuItemClass} onClick={() => runAction(() => share(menu.id))}>
                            Bagikan
                        </button>
                        <button
                            type="button"
                            className={menuItemClass}
                            onClick={() =>
                                runAction(() => {
                                    setEditingId(menuConv.id);
                                    setEditTitle(menuConv.title);
                                })
                            }
                        >
                            Ganti nama
                        </button>
                        <button type="button" className={menuItemClass} onClick={() => runAction(() => archive(menu.id))}>
                            Arsipkan
                        </button>
                        <div className="my-1 h-px bg-white/10" />
                        <button
                            type="button"
                            className="block w-full rounded-[6px] px-2.5 py-1.5 text-left text-[13px] text-ember transition-colors hover:bg-ember/10"
                            onClick={() => runAction(() => remove(menu.id))}
                        >
                            Hapus
                        </button>
                    </div>
                </>
            )}
        </Sidebar>
    );
}
