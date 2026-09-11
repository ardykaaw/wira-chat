<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 1 (panduan.md §9.6 + kontrak §6.7): simpan feedback jawaban WIRA.
 * Berpasangan dengan correlation_id yang dikirim di respons /v1/chat.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wira_feedback', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->uuid('correlation_id');
            $table->enum('rating', ['up', 'down']);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('correlation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wira_feedback');
    }
};
