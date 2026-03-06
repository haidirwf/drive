<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'folder_id',
        'original_name',
        'storage_name',
        'storage_path',
        'mime_type',
        'size',
        'extension',
        'is_starred',
    ];

    protected $casts = [
        'is_starred' => 'boolean',
    ];

    public function folder()
    {
        return $this->belongsTo(Folder::class, 'folder_id');
    }

    public function shareLinks()
    {
        return $this->hasMany(ShareLink::class, 'file_id');
    }
}
