<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_id',
        'token',
        'expires_at',
        'password',
        'download_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'download_count' => 'integer',
        'file_id' => 'integer'
    ];

    public function file()
    {
        return $this->belongsTo(File::class, 'file_id');
    }
}
