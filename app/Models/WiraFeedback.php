<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WiraFeedback extends Model
{
    protected $table = 'wira_feedback';

    protected $fillable = [
        'user_id',
        'correlation_id',
        'rating',
        'note',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
