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
        'attachment_url',
        'attachment_name',
        'attachment_type',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WiraConversation::class, 'conversation_id');
    }
}
