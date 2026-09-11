import React from 'react';

// Render jawaban WIRA sebagai teks bacaan editorial (design-wira.md §7):
// tanpa bubble, warna mist, lebar baca dibatasi oleh parent (~72ch).
// Parser markdown ringan — hanya yang dibutuhkan Fase 1: paragraf, bold, inline code,
// heading, list, dan tabel (untuk jawaban parameter).

function renderInline(text: string, keyPrefix: string) {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-mist">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={`${keyPrefix}-c-${i}`}
                    className="rounded-[4px] bg-white/[0.08] px-1.5 py-0.5 font-mono text-[13px] text-mist/90"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
    });
}

function Table({ header, rows, tkey }: { header: string[]; rows: string[][]; tkey: string }) {
    return (
        <div key={tkey} className="my-4 overflow-x-auto rounded-shell border border-white/10">
            <table className="min-w-full text-left text-[14px]">
                <thead>
                    <tr className="border-b border-white/10">
                        {header.map((h, i) => (
                            <th key={i} className="px-3 py-2 font-mono text-[13px] font-medium text-mist/70">
                                {renderInline(h, `${tkey}-h-${i}`)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, r) => (
                        <tr key={r} className="border-b border-white/[0.06] last:border-0">
                            {row.map((cell, c) => (
                                <td key={c} className="px-3 py-2 text-mist/85">
                                    {renderInline(cell, `${tkey}-r${r}-${c}`)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AnswerBody({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    let tableHeader: string[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    const flushTable = (key: string) => {
        if (inTable && tableHeader.length > 0) {
            elements.push(<Table key={key} tkey={key} header={tableHeader} rows={tableRows} />);
        }
        inTable = false;
        tableHeader = [];
        tableRows = [];
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Tabel markdown
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed.slice(1, -1).split('|').map((c) => c.trim());
            if (/^[-\s|]+$/.test(trimmed.replace(/\|/g, ''))) return; // baris pemisah
            if (!inTable) {
                inTable = true;
                tableHeader = cells;
            } else {
                tableRows.push(cells);
            }
            return;
        }
        if (inTable) flushTable(`table-${idx}`);

        if (trimmed === '') {
            elements.push(<div key={idx} className="h-3" />);
        } else if (trimmed.startsWith('### ')) {
            elements.push(
                <h3 key={idx} className="mt-4 mb-1 text-[17px] font-medium text-mist">
                    {renderInline(trimmed.slice(4), `h3-${idx}`)}
                </h3>,
            );
        } else if (trimmed.startsWith('## ')) {
            elements.push(
                <h2 key={idx} className="mt-5 mb-2 text-[19px] font-medium text-mist">
                    {renderInline(trimmed.slice(3), `h2-${idx}`)}
                </h2>,
            );
        } else if (/^\d+\.\s/.test(trimmed)) {
            elements.push(
                <div key={idx} className="my-1 flex gap-2 text-[16px] leading-relaxed text-mist/85">
                    <span className="font-mono text-[13px] text-mist/50">{trimmed.match(/^\d+/)?.[0]}.</span>
                    <span>{renderInline(trimmed.replace(/^\d+\.\s/, ''), `ol-${idx}`)}</span>
                </div>,
            );
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
                <div key={idx} className="my-1 flex gap-2 text-[16px] leading-relaxed text-mist/85">
                    <span className="text-mist/40">—</span>
                    <span>{renderInline(trimmed.slice(2), `ul-${idx}`)}</span>
                </div>,
            );
        } else {
            elements.push(
                <p key={idx} className="text-[16px] leading-relaxed text-mist/90">
                    {renderInline(line, `p-${idx}`)}
                </p>,
            );
        }
    });

    flushTable('table-end');

    return <div className="space-y-0.5">{elements}</div>;
}
