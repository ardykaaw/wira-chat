import { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';
import AnswerBody from '@/components/wira/AnswerBody';
import CitationList, { CitationMarkers } from '@/components/wira/CitationList';
import FeedbackControl from '@/components/wira/FeedbackControl';
import EmptyState from '@/components/wira/EmptyState';
import InputDock from '@/components/wira/InputDock';
import type { ChatResponse, Citation, WiraConversation, WiraMessage } from '@/types/wira';

interface Props {
    conversations: WiraConversation[];
    activeConversation?: WiraConversation | null;
    messages: WiraMessage[];
}

interface StreamingState {
    text: string;
    citations: Citation[];
    confidenceNote: string | null;
    blocked: boolean;
    correlationId: string | null;
    done: boolean;
}

function csrf(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Chat({ activeConversation, messages: initialMessages }: Props) {
    const [messages, setMessages] = useState<WiraMessage[]>(initialMessages ?? []);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState<StreamingState | null>(null);
    const [isSending, setIsSending] = useState(false);

    const conversationIdRef = useRef<number | null>(activeConversation?.id ?? null);
    const streamEndRef = useRef<HTMLDivElement>(null);
    const sidebar = useSidebar();

    useEffect(() => {
        setMessages(initialMessages ?? []);
        conversationIdRef.current = activeConversation?.id ?? null;
    }, [initialMessages, activeConversation]);

    useEffect(() => {
        streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streaming]);

    // Efek streaming disimulasikan dari data mock (panduan.md §9 Fase 1.2):
    // jawaban penuh diterima dari endpoint, lalu diungkap bertahap kata-per-kata.
    const simulateStream = async (res: ChatResponse) => {
        const words = res.answer.split(/(\s+)/);
        const base: Omit<StreamingState, 'text' | 'done'> = {
            citations: res.citations,
            confidenceNote: res.confidence_note,
            blocked: res.blocked,
            correlationId: res.correlation_id,
        };

        let acc = '';
        setStreaming({ ...base, text: '', done: false });
        for (const word of words) {
            acc += word;
            setStreaming({ ...base, text: acc, done: false });
            if (word.trim().length > 0) await sleep(28);
        }

        setMessages((prev) => [...prev, res.ai_message]);
        setStreaming(null);
    };

    const ensureConversation = async (): Promise<number | null> => {
        if (conversationIdRef.current) return conversationIdRef.current;
        try {
            const res = await fetch('/wira/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
            });
            const data = (await res.json()) as { conversation: WiraConversation };
            conversationIdRef.current = data.conversation.id;
            return data.conversation.id;
        } catch {
            return null;
        }
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isSending) return;

        setIsSending(true);
        const isNewConversation = conversationIdRef.current === null;
        const conversationId = await ensureConversation();
        if (!conversationId) {
            setIsSending(false);
            return;
        }

        const tempId = Date.now();
        setMessages((prev) => [...prev, { id: tempId, role: 'user', content: text }]);
        setInput('');

        try {
            const res = await fetch(`/wira/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = (await res.json()) as ChatResponse;

            setMessages((prev) => prev.map((m) => (m.id === tempId ? data.user_message : m)));
            await simulateStream(data);

            if (isNewConversation) {
                // Percakapan baru dibuat dari empty state: muat ulang termasuk `messages`
                // supaya sinkronisasi state tidak mengosongkan percakapan yang baru dibuat.
                router.reload({ only: ['conversations', 'activeConversation', 'messages'] });
            } else {
                // Segarkan sidebar saja: judul percakapan (diambil dari pertanyaan pertama)
                // dan urutan terbaru ikut ter-update, tanpa menyentuh daftar pesan.
                router.reload({ only: ['conversations'] });
            }
        } catch {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setStreaming(null);
        } finally {
            setIsSending(false);
        }
    };

    const hasContent = messages.length > 0 || streaming !== null;

    return (
        <>
            <Head title="WIRA" />

            <div className="wira-gradient relative flex h-full min-h-0 flex-1 flex-col">
                {/* Pemicu drawer sidebar untuk mobile (§11) — teks, bukan ikon */}
                <div className="flex h-11 shrink-0 items-center px-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => sidebar.setOpenMobile(true)}
                        className="font-mono text-[13px] text-mist/60 underline decoration-mist/25 underline-offset-4"
                    >
                        Riwayat
                    </button>
                </div>

                {/* Message stream */}
                <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-4 py-6 sm:px-8">
                    {!hasContent ? (
                        <EmptyState />
                    ) : (
                        <div className="mx-auto w-full max-w-[74ch] space-y-8">
                            {messages.map((msg) =>
                                msg.role === 'user' ? (
                                    <div key={msg.id} className="flex justify-end">
                                        <div className="glass max-w-[85%] rounded-dock px-4 py-2.5 text-[16px] leading-relaxed text-mist">
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={msg.id}>
                                        {msg.blocked ? (
                                            <p className="text-[16px] italic leading-relaxed text-mist/60">{msg.content}</p>
                                        ) : (
                                            <>
                                                <div>
                                                    <AnswerBody content={msg.content} />
                                                    <CitationMarkers count={msg.citations?.length ?? 0} />
                                                </div>
                                                {msg.confidence_note && (
                                                    <p className="mt-3 font-mono text-[13px] leading-relaxed text-mist/50">
                                                        {msg.confidence_note}
                                                    </p>
                                                )}
                                                <CitationList citations={msg.citations ?? []} />
                                                <FeedbackControl correlationId={msg.correlation_id} />
                                            </>
                                        )}
                                    </div>
                                ),
                            )}

                            {/* Jawaban yang sedang disusun — pita cahaya di tepi kiri (§6) */}
                            {streaming && (
                                <div className="answer-streaming">
                                    {streaming.blocked ? (
                                        <p className="text-[16px] italic leading-relaxed text-mist/60">{streaming.text}</p>
                                    ) : (
                                        <AnswerBody content={streaming.text} />
                                    )}
                                </div>
                            )}

                            <div ref={streamEndRef} />
                        </div>
                    )}
                </div>

                {/* Input dock + disclaimer */}
                <div className="shrink-0 px-4 pb-5 pt-2 sm:px-8">
                    <InputDock value={input} onChange={setInput} onSend={handleSend} disabled={isSending} />
                </div>
            </div>
        </>
    );
}
