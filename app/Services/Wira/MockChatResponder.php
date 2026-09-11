<?php

namespace App\Services\Wira;

/**
 * Fase 1 (panduan.md §9.8): peniru sederhana untuk POST /v1/chat.
 *
 * Rule-based murni — TANPA AI sungguhan. Mengembalikan potongan data
 * yang bentuknya persis kontrak §6.1 (answer + citations + blocked + confidence_note),
 * supaya frontend dibangun terhadap kontrak final sejak awal dan tidak perlu
 * dirombak saat Orchestrator asli menyusul di Fase 2.
 *
 * DIHAPUS di Fase 2 saat endpoint ini diganti proxy ke Orchestrator (panduan.md §10.2).
 */
class MockChatResponder
{
    /**
     * @return array{answer:string,citations:array<int,array<string,string>>,confidence_note:?string,blocked:bool,blocked_reason:?string}
     */
    public function respond(string $message): array
    {
        $text = mb_strtolower(trim($message));

        if ($this->isRestricted($text)) {
            return $this->blocked();
        }

        if ($this->contains($text, ['sop', 'prosedur', 'start-up', 'startup', 'langkah', 'panduan'])) {
            return $this->sopAnswer();
        }

        if ($this->contains($text, ['parameter', 'tekanan', 'suhu', 'temperatur', 'vibrasi', 'putaran', 'rpm', 'mesin'])) {
            return $this->parameterAnswer();
        }

        if ($this->contains($text, ['status', 'pekerjaan', 'work order', 'wo', 'progres', 'maximo'])) {
            return $this->workStatusAnswer();
        }

        return $this->defaultAnswer();
    }

    private function contains(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function isRestricted(string $text): bool
    {
        return $this->contains($text, ['gaji', 'payroll', 'anggaran', 'finansial', 'keuangan', 'rahasia', 'password', 'kredensial']);
    }

    /**
     * Status diblokir (design-wira.md §8.3) — nada tenang, faktual, tanpa citations.
     */
    private function blocked(): array
    {
        return [
            'answer' => 'Informasi ini di luar cakupan akses Anda saat ini. Hubungi pemilik data terkait bila diperlukan.',
            'citations' => [],
            'confidence_note' => null,
            'blocked' => true,
            'blocked_reason' => 'classification_restricted',
        ];
    }

    private function sopAnswer(): array
    {
        return [
            'answer' => "Prosedur start-up genset mengikuti tiga tahap utama sebelum unit dibebani.\n\n"
                . "1. Pemeriksaan awal — pastikan level pelumas, air pendingin, dan bahan bakar berada pada batas normal, serta tidak ada indikasi kebocoran di ruang mesin.\n"
                . "2. Cranking dan idle — jalankan unit pada putaran idle 3–5 menit hingga tekanan pelumas stabil di atas 3,5 bar dan suhu air pendingin naik bertahap.\n"
                . "3. Sinkronisasi — samakan tegangan dan frekuensi dengan jaringan sebelum breaker ditutup, lalu naikkan beban secara bertahap.\n\n"
                . "Verifikasi setiap tahap terhadap dokumen sumber sebelum unit dinyatakan siap operasi.",
            'citations' => [
                ['source_type' => 'document', 'document_id' => 'SOP-OPS-014', 'title' => 'Prosedur Start-Up Genset', 'chunk_ref' => 'hal. 3 §2.1'],
                ['source_type' => 'document', 'document_id' => 'SOP-OPS-014', 'title' => 'Prosedur Start-Up Genset', 'chunk_ref' => 'hal. 4 §2.3'],
            ],
            'confidence_note' => null,
            'blocked' => false,
            'blocked_reason' => null,
        ];
    }

    private function parameterAnswer(): array
    {
        return [
            'answer' => "Parameter operasi terakhir yang tercatat untuk unit yang diminta berada dalam rentang normal.\n\n"
                . "| Parameter | Nilai | Batas Normal |\n"
                . "| --- | --- | --- |\n"
                . "| Tekanan pelumas | 4,1 bar | 3,5–5,5 bar |\n"
                . "| Suhu air pendingin | 78 °C | < 90 °C |\n"
                . "| Vibrasi bantalan | 2,8 mm/s | < 4,5 mm/s |\n\n"
                . "Nilai di atas merupakan pembacaan terakhir dari data mock Fase 1 dan bukan telemetry real-time.",
            'citations' => [
                ['source_type' => 'system', 'system' => 'datakompak', 'record_id' => 'TAG-PLTD-P1-LO-PRESS'],
                ['source_type' => 'document', 'document_id' => 'MAN-ENG-021', 'title' => 'Batas Parameter Operasi Mesin', 'chunk_ref' => 'tabel 5'],
            ],
            'confidence_note' => 'Pembacaan terakhir berumur lebih dari 15 menit — konfirmasi ke ruang kendali untuk nilai terkini.',
            'blocked' => false,
            'blocked_reason' => null,
        ];
    }

    private function workStatusAnswer(): array
    {
        return [
            'answer' => "Terdapat satu pekerjaan pemeliharaan yang masih berjalan untuk unit terkait.\n\n"
                . "Work order WO-88213 (penggantian seal pompa) berstatus in-progress dengan progres 75%. "
                . "Target penyelesaian tercatat dua hari kerja dari sekarang, menunggu ketersediaan satu suku cadang.",
            'citations' => [
                ['source_type' => 'system', 'system' => 'maximo', 'record_id' => 'WO-88213'],
            ],
            'confidence_note' => null,
            'blocked' => false,
            'blocked_reason' => null,
        ];
    }

    private function defaultAnswer(): array
    {
        return [
            'answer' => "Belum ada informasi spesifik yang cocok dengan pertanyaan tersebut pada data yang berwenang diakses.\n\n"
                . "Coba sebutkan nama unit, nomor SOP, atau nomor work order agar pencarian lebih tepat. "
                . "Contoh: prosedur start-up genset, parameter PLTD Poasia unit 1, atau status WO-88213.",
            'citations' => [],
            'confidence_note' => null,
            'blocked' => false,
            'blocked_reason' => null,
        ];
    }
}
