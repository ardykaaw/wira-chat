<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 1 (panduan.md §9): sejajarkan tabel pesan dengan kontrak respons /v1/chat (§6.1).
 * Fitur lampiran file dihapus (tidak termasuk Fase 1), diganti field kontrak:
 * citations, confidence_note, blocked, blocked_reason, correlation_id.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wira_messages', function (Blueprint $table) {
            if (Schema::hasColumn('wira_messages', 'attachment_url')) {
                $table->dropColumn(['attachment_url', 'attachment_name', 'attachment_type']);
            }
        });

        Schema::table('wira_messages', function (Blueprint $table) {
            $table->json('citations')->nullable()->after('content');
            $table->string('confidence_note')->nullable()->after('citations');
            $table->boolean('blocked')->default(false)->after('confidence_note');
            $table->string('blocked_reason')->nullable()->after('blocked');
            $table->uuid('correlation_id')->nullable()->after('blocked_reason');
        });
    }

    public function down(): void
    {
        Schema::table('wira_messages', function (Blueprint $table) {
            $table->dropColumn(['citations', 'confidence_note', 'blocked', 'blocked_reason', 'correlation_id']);
            $table->string('attachment_url')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_type')->nullable();
        });
    }
};
