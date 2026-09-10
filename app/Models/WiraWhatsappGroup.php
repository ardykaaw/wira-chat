<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WiraWhatsappGroup extends Model
{
    protected $fillable = [
        'name',
        'group_id',
        'category',
        'is_active',
    ];

    public function messageLogs(): HasMany
    {
        return $this->hasMany(WiraMessageLog::class);
    }
}
