// Empty state sesi baru (design-wira.md §8.1): judul editorial, tanpa sapaan generik,
// tanpa emoji, tanpa nama produk digradasi, tanpa sparkle. Judul + satu baris penjelas.

export default function EmptyState() {
    return (
        <div className="mx-auto max-w-[64ch] px-2 py-16">
            <h1 className="text-[32px] font-medium leading-[1.15] text-mist">Ada yang perlu ditemukan?</h1>
            <p className="mt-3 text-[16px] leading-relaxed text-mist/60">
                Cari SOP, parameter mesin, atau status pekerjaan.
            </p>
        </div>
    );
}
