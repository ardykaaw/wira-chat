import type { Citation } from '@/types/wira';

// Rujukan sebagai footnote bernomor, mono 13px (design-wira.md §8.2).
// Bukan chip/badge berwarna dengan ikon.

const SUPERSCRIPTS = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

function superscript(n: number): string {
    return SUPERSCRIPTS[n - 1] ?? `[${n}]`;
}

function label(cite: Citation): string {
    if (cite.source_type === 'document') {
        const base = `${cite.document_id} · ${cite.title}`;
        return cite.chunk_ref ? `${base} · ${cite.chunk_ref}` : base;
    }
    const system = cite.system.charAt(0).toUpperCase() + cite.system.slice(1);
    return `${system} · ${cite.record_id}`;
}

export function CitationMarkers({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <sup className="ml-0.5 font-mono text-[11px] text-signal/90">
            {Array.from({ length: count }, (_, i) => superscript(i + 1)).join(' ')}
        </sup>
    );
}

export default function CitationList({ citations }: { citations: Citation[] }) {
    if (!citations || citations.length === 0) return null;
    return (
        <ul className="mt-3 space-y-1">
            {citations.map((cite, i) => (
                <li key={i} className="font-mono text-[13px] leading-relaxed text-mist/60">
                    <span className="text-signal/90">{superscript(i + 1)}</span>{' '}
                    {label(cite)}
                </li>
            ))}
        </ul>
    );
}
