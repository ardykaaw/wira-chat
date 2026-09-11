<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Aksi per-percakapan di sidebar (sematkan & arsipkan) — Fase 1.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wira_conversations', function (Blueprint $table) {
            $table->timestamp('pinned_at')->nullable()->after('title');
            $table->timestamp('archived_at')->nullable()->after('pinned_at');
        });
    }

    public function down(): void
    {
        Schema::table('wira_conversations', function (Blueprint $table) {
            $table->dropColumn(['pinned_at', 'archived_at']);
        });
    }
};
