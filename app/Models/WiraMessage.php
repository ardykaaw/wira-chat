<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WiraMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'citations',
        'confidence_note',
        'blocked',
        'blocked_reason',
        'correlation_id',
    ];

    protected $casts = [
        'citations' => 'array',
        'blocked' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WiraConversation::class, 'conversation_id');
    }
}
