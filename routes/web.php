<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Wira\WiraChatController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Antarmuka Chat WIRA menjadi halaman utama (Fase 1 — panduan.md §9)
    Route::get('/dashboard', [WiraChatController::class, 'index'])->name('dashboard');
    Route::get('/wira/chat', [WiraChatController::class, 'index'])->name('wira.chat');

    // Riwayat percakapan (disimpan di MySQL lewat Laravel — panduan.md §9 Fase 1.7)
    Route::post('/wira/chat/conversations', [WiraChatController::class, 'store'])->name('wira.chat.conversations.store');
    Route::patch('/wira/chat/conversations/{id}/title', [WiraChatController::class, 'updateTitle'])->name('wira.chat.conversations.title.update');
    Route::patch('/wira/chat/conversations/{id}/pin', [WiraChatController::class, 'togglePin'])->name('wira.chat.conversations.pin');
    Route::patch('/wira/chat/conversations/{id}/archive', [WiraChatController::class, 'archive'])->name('wira.chat.conversations.archive');
    Route::delete('/wira/chat/conversations/{id}', [WiraChatController::class, 'destroy'])->name('wira.chat.conversations.destroy');

    // Mock endpoint POST /v1/chat (kontrak §6.1) — jawaban dummy + citations, tanpa AI asli.
    Route::post('/wira/chat/conversations/{id}/messages', [WiraChatController::class, 'sendMessage'])->name('wira.chat.messages.send');

    // Feedback jawaban (kontrak §6.7) — POST /v1/chat/feedback
    Route::post('/wira/chat/feedback', [WiraChatController::class, 'feedback'])->name('wira.chat.feedback');
});

require __DIR__.'/settings.php';
