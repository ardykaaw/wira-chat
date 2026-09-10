<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Wira\WiraChatController;
use App\Http\Controllers\Wira\WiraWhatsappGroupController;
use App\Http\Controllers\Wira\WiraWhatsappController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // WIRA Chat menjadi Halaman Utama (Dashboard)
    Route::get('/dashboard', [WiraChatController::class, 'index'])->name('dashboard');
    Route::get('/wira/chat', [WiraChatController::class, 'index'])->name('wira.chat');

    // Conversations API
    Route::post('/wira/chat/conversations', [WiraChatController::class, 'store'])->name('wira.chat.conversations.store');
    Route::post('/wira/chat/conversations/{id}/messages', [WiraChatController::class, 'sendMessage'])->name('wira.chat.messages.send');
    Route::patch('/wira/chat/conversations/{id}/title', [WiraChatController::class, 'updateTitle'])->name('wira.chat.conversations.title.update');
    Route::delete('/wira/chat/conversations/{id}', [WiraChatController::class, 'destroy'])->name('wira.chat.conversations.destroy');

    // WhatsApp Groups API (Data Master)
    Route::get('/wira/whatsapp-groups', [WiraWhatsappGroupController::class, 'index'])->name('wira.whatsapp.groups');
    Route::post('/wira/whatsapp-groups', [WiraWhatsappGroupController::class, 'store'])->name('wira.whatsapp.groups.store');
    Route::patch('/wira/whatsapp-groups/{id}', [WiraWhatsappGroupController::class, 'update'])->name('wira.whatsapp.groups.update');
    Route::delete('/wira/whatsapp-groups/{id}', [WiraWhatsappGroupController::class, 'destroy'])->name('wira.whatsapp.groups.destroy');

    // WhatsApp Send & Connection API
    Route::post('/wira/whatsapp/send', [WiraWhatsappController::class, 'send'])->name('wira.whatsapp.send');
    Route::get('/wira/whatsapp/status', [WiraWhatsappController::class, 'status'])->name('wira.whatsapp.status');
    Route::post('/wira/whatsapp/logout', [WiraWhatsappController::class, 'logout'])->name('wira.whatsapp.logout');
});

require __DIR__.'/settings.php';
