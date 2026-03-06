<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;

class StorageStatsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usedBytes = File::sum('size');
        $fileCount = File::count();
        $folderCount = Folder::count();

        // Limit defaults to 100GB if not specified
        $storageQuotaGB = env('STORAGE_QUOTA_GB', 100);
        $totalBytes = $storageQuotaGB * 1024 * 1024 * 1024;

        return response()->json([
            'used_bytes' => (int) $usedBytes,
            'file_count' => $fileCount,
            'folder_count' => $folderCount,
            'total_bytes' => (int) $totalBytes
        ]);
    }
}
