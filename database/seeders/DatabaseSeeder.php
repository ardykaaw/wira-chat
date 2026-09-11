<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Fase 1 (panduan.md §9): tidak ada data seed yang diperlukan.
        // Riwayat percakapan & pesan dibuat lewat interaksi user di UI chat.
    }
}
