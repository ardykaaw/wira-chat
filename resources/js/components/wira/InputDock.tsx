import { useRef, useState } from 'react';

// Input dock (design-wira.md §8.5, §6): permukaan kaca, radius 20px, outline bergerak.
// Tombol kirim = teks "Kirim" (bukan ikon), signal solid saat ada teks, redup saat kosong.
// Disclaimer statis di bawahnya (§8.6) — selalu terlihat, tidak bisa ditutup.

interface Props {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    disabled?: boolean;
}

export default function InputDock({ value, onChange, onSend, disabled = false }: Props) {
    const [focused, setFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasText = value.trim().length > 0;
    const canSend = hasText && !disabled;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (canSend) onSend();
        }
    };

    return (
        <div className="mx-auto w-full max-w-[74ch]">
            <div
                className="input-dock glass flex items-end gap-3 px-4 py-3"
                data-typing={focused && hasText ? 'true' : 'false'}
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    rows={1}
                    placeholder="Tanyakan tentang data pembangkit, SOP, atau status pekerjaan…"
                    className="max-h-40 flex-1 resize-none bg-transparent py-1 text-[16px] leading-relaxed text-mist placeholder:text-mist/40 focus:outline-none"
                />
                <button
                    type="button"
                    onClick={() => canSend && onSend()}
                    disabled={!canSend}
                    className={`shrink-0 rounded-[12px] px-4 py-1.5 text-[14px] font-medium transition-colors ${
                        canSend
                            ? 'bg-mist text-[#212121] hover:bg-white'
                            : 'cursor-not-allowed text-mist/35'
                    }`}
                    aria-label="Kirim"
                >
                    Kirim
                </button>
            </div>

            <p className="mt-2.5 px-1 text-center font-mono text-[13px] leading-relaxed text-mist/60">
                WIRA dapat keliru — verifikasi ke sumber sebelum digunakan untuk keputusan operasional.
            </p>
        </div>
    );
}
