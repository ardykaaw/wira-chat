// Bentuk data mengikuti kontrak API final WIRA (panduan.md §6.1) — dipakai sejak Fase 1
// supaya frontend tidak berubah saat backend asli (Orchestrator) menyusul di Fase 2.

export type Citation =
    | {
          source_type: 'document';
          document_id: string;
          title: string;
          chunk_ref: string;
      }
    | {
          source_type: 'system';
          system: string;
          record_id: string;
      };

export interface WiraMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[] | null;
    confidence_note?: string | null;
    blocked?: boolean;
    blocked_reason?: string | null;
    correlation_id?: string | null;
    created_at?: string;
}

export interface WiraConversation {
    id: number;
    title: string;
    updated_at?: string;
    pinned_at?: string | null;
    archived_at?: string | null;
}

// Respons /v1/chat (kontrak §6.1). ai_message/user_message adalah tambahan Laravel
// untuk persistensi riwayat (Fase 1.7); field lain identik dengan kontrak Orchestrator.
export interface ChatResponse {
    session_id: string;
    answer: string;
    citations: Citation[];
    confidence_note: string | null;
    blocked: boolean;
    blocked_reason: string | null;
    correlation_id: string;
    user_message: WiraMessage;
    ai_message: WiraMessage;
}
