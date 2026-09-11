import { useState } from 'react';

// Dua tautan teks kecil, bukan ikon jempol (design-wira.md §8.4).
// Diklik → berubah warna signal, tanpa animasi tambahan. Memanggil kontrak §6.7.

type Rating = 'up' | 'down';

function csrf(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
}

export default function FeedbackControl({ correlationId }: { correlationId?: string | null }) {
    const [selected, setSelected] = useState<Rating | null>(null);

    if (!correlationId) return null;

    const send = async (rating: Rating) => {
        setSelected(rating);
        try {
            await fetch('/wira/chat/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ correlation_id: correlationId, rating, note: null }),
            });
        } catch {
            // Fase 1: feedback boleh silent-fail; tidak mengganggu alur baca.
        }
    };

    const linkClass = (rating: Rating) =>
        `transition-colors ${selected === rating ? 'text-signal' : 'text-mist/50 hover:text-mist/80'}`;

    return (
        <div className="mt-3 flex items-center gap-2 font-mono text-[13px]">
            <button type="button" onClick={() => send('up')} className={linkClass('up')}>
                Berguna
            </button>
            <span className="text-mist/25">·</span>
            <button type="button" onClick={() => send('down')} className={linkClass('down')}>
                Kurang tepat
            </button>
        </div>
    );
}
