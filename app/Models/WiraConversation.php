<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WiraConversation extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'pinned_at',
        'archived_at',
    ];

    protected $casts = [
        'pinned_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(WiraMessage::class, 'conversation_id');
    }
}
