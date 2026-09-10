<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     */
    public function run(): void
    {
        if (\App\Models\WiraWhatsappGroup::count() === 0) {
            \App\Models\WiraWhatsappGroup::create([
                'name' => 'Grup WA Operasi & System Control UP Kendari',
                'group_id' => '1203630123456789@g.us',
                'category' => 'Operasional',
                'is_active' => true,
            ]);
            \App\Models\WiraWhatsappGroup::create([
                'name' => 'Grup Pemeliharaan & Harkit UP Kendari',
                'group_id' => '1203630987654321@g.us',
                'category' => 'Pemeliharaan',
                'is_active' => true,
            ]);
            \App\Models\WiraWhatsappGroup::create([
                'name' => 'Grup K3L & Lingkungan UP Kendari',
                'group_id' => '1203631122334455@g.us',
                'category' => 'K3L',
                'is_active' => true,
            ]);
        }
    }
}
