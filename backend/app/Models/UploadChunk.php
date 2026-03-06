<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UploadChunk extends Model
{
    use HasFactory;

    protected $fillable = [
        'upload_id',
        'chunk_index',
        'total_chunks',
        'filename',
        'stored_at',
    ];

    protected $casts = [
        'chunk_index' => 'integer',
        'total_chunks' => 'integer',
    ];
}
