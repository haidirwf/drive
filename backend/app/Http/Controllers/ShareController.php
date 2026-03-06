<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\ShareLink;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Services\FileStorageService;

class ShareController extends Controller
{
    /**
     * Store (generate) a secure share token
     */
    public function store(Request $request, string $id)
    {
        $file = File::findOrFail($id);

        $request->validate([
            'expires_in_days' => 'nullable|integer|min:1',
            'password' => 'nullable|string|min:4'
        ]);

        $token = Str::random(40);

        $shareLink = ShareLink::create([
            'file_id' => $file->id,
            'token' => $token,
            'expires_at' => $request->expires_in_days ? now()->addDays($request->expires_in_days) : null,
            'password' => $request->password ? Hash::make($request->password) : null,
        ]);

        return response()->json([
            'url' => url("/share/{$token}"),
            'token' => $token,
            'expires_at' => $shareLink->expires_at
        ], 201);
    }

    /**
     * List share links for a file
     */
    public function index(string $id)
    {
        $file = File::findOrFail($id);
        $links = ShareLink::where('file_id', $file->id)->get();
        return response()->json($links);
    }

    /**
     * Revoke share link
     */
    public function destroy(string $token)
    {
        ShareLink::where('token', $token)->delete();
        return response()->json(['message' => 'Link revoked']);
    }

    /**
     * PUBLIC show file metadata via token
     */
    public function showPublic(string $token)
    {
        $link = ShareLink::where('token', $token)->firstOrFail();

        if ($link->expires_at && now()->isAfter($link->expires_at)) {
            return response()->json(['error' => 'Link expired'], 410);
        }

        $file = $link->file;

        return response()->json([
            'original_name' => $file->original_name,
            'size' => $file->size,
            'mime_type' => $file->mime_type,
            'has_password' => !is_null($link->password)
        ]);
    }

    /**
     * PUBLIC download file
     */
    public function downloadPublic(Request $request, string $token, FileStorageService $storageService)
    {
        $link = ShareLink::where('token', $token)->firstOrFail();

        if ($link->expires_at && now()->isAfter($link->expires_at)) {
            return response()->json(['error' => 'Link expired'], 410);
        }

        if ($link->password && !Hash::check($request->header('X-Share-Password', $request->query('password')), $link->password)) {
            return response()->json(['error' => 'Invalid password'], 403);
        }

        $link->increment('download_count');

        return $storageService->streamFile($link->file, false);
    }
}
