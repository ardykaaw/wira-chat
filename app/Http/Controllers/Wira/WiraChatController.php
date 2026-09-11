<?php

namespace App\Http\Controllers\Wira;

use App\Models\WiraConversation;
use App\Models\WiraFeedback;
use App\Models\WiraMessage;
use App\Services\Wira\MockChatResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Antarmuka Chat WIRA — Fase 1 (panduan.md §9).
 *
 * Backend masih mock: sendMessage() meniru kontrak POST /v1/chat (§6.1) dengan
 * jawaban rule-based + citations dummy. Tidak ada AI/RAG/tool asli di fase ini.
 * Riwayat percakapan tetap disimpan di MySQL (Fase 1.7).
 */
class WiraChatController
{
    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = WiraConversation::where('user_id', $user->id)
            ->whereNull('archived_at')
            ->orderByDesc('pinned_at') // tersemat di atas (NULL jatuh ke bawah pada DESC)
            ->orderByDesc('updated_at')
            ->get();

        $conversationId = $request->query('conversation_id');
        $activeConversation = null;

        if ($conversationId) {
            $activeConversation = $conversations->firstWhere('id', $conversationId);
        }

        if (! $activeConversation) {
            $activeConversation = $conversations->first();
        }

        $messages = $activeConversation
            ? $activeConversation->messages()->orderBy('created_at', 'asc')->get()
            : collect();

        return inertia('wira/Chat', [
            'conversations' => $conversations,
            'activeConversation' => $activeConversation,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $conversation = WiraConversation::create([
            'user_id' => $request->user()->id,
            'title' => 'Percakapan baru',
        ]);

        return response()->json([
            'conversation' => $conversation,
            'conversation_id' => $conversation->id,
        ]);
    }

    /**
     * Mock POST /v1/chat (kontrak §6.1). Menyimpan pesan user + jawaban WIRA,
     * lalu mengembalikan payload dengan bentuk final: answer, citations,
     * confidence_note, blocked, blocked_reason, correlation_id.
     */
    public function sendMessage(Request $request, string $conversationId, MockChatResponder $responder)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:4000',
        ]);

        $conversation = WiraConversation::where('user_id', $request->user()->id)
            ->findOrFail($conversationId);

        $userPrompt = trim($validated['message']);

        $userMessage = WiraMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userPrompt,
        ]);

        if (in_array($conversation->title, ['Percakapan baru', 'Percakapan Baru'], true)) {
            $conversation->update(['title' => Str::limit($userPrompt, 40)]);
        } else {
            $conversation->touch();
        }

        $result = $responder->respond($userPrompt);
        $correlationId = (string) Str::uuid();

        $aiMessage = WiraMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $result['answer'],
            'citations' => $result['citations'],
            'confidence_note' => $result['confidence_note'],
            'blocked' => $result['blocked'],
            'blocked_reason' => $result['blocked_reason'],
            'correlation_id' => $correlationId,
        ]);

        // Payload kontrak §6.1 — bentuk data sama persis dengan mode streaming (§6.2),
        // supaya frontend tidak berubah saat disambung ke Orchestrator asli.
        return response()->json([
            'session_id' => (string) $conversation->id,
            'answer' => $result['answer'],
            'citations' => $result['citations'],
            'confidence_note' => $result['confidence_note'],
            'blocked' => $result['blocked'],
            'blocked_reason' => $result['blocked_reason'],
            'correlation_id' => $correlationId,
            'user_message' => $userMessage,
            'ai_message' => $aiMessage,
        ]);
    }

    /**
     * Mock POST /v1/chat/feedback (kontrak §6.7).
     */
    public function feedback(Request $request)
    {
        $validated = $request->validate([
            'correlation_id' => 'required|uuid',
            'rating' => 'required|in:up,down',
            'note' => 'nullable|string|max:1000',
        ]);

        WiraFeedback::create([
            'user_id' => $request->user()->id,
            'correlation_id' => $validated['correlation_id'],
            'rating' => $validated['rating'],
            'note' => $validated['note'] ?? null,
        ]);

        return response()->json(['status' => 'ok']);
    }

    public function updateTitle(Request $request, string $conversationId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $conversation = WiraConversation::where('user_id', $request->user()->id)
            ->findOrFail($conversationId);
        $conversation->update(['title' => $validated['title']]);

        return response()->json(['success' => true, 'title' => $conversation->title]);
    }

    public function togglePin(Request $request, string $conversationId)
    {
        $conversation = WiraConversation::where('user_id', $request->user()->id)
            ->findOrFail($conversationId);
        $conversation->update(['pinned_at' => $conversation->pinned_at ? null : now()]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'pinned' => (bool) $conversation->pinned_at]);
        }

        return back();
    }

    public function archive(Request $request, string $conversationId)
    {
        $conversation = WiraConversation::where('user_id', $request->user()->id)
            ->findOrFail($conversationId);
        $conversation->update(['archived_at' => now(), 'pinned_at' => null]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('dashboard');
    }

    public function destroy(Request $request, string $conversationId)
    {
        $conversation = WiraConversation::where('user_id', $request->user()->id)
            ->findOrFail($conversationId);
        $conversation->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('dashboard');
    }
}
