<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\UploadChunk;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\FileStorageService;

class UploadController extends Controller
{
    /**
     * Handle single direct upload (< 10MB)
     */
    public function direct(Request $request, FileStorageService $storageService)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'folder_id' => 'nullable|exists:folders,id'
        ]);

        $uploadedFile = $request->file('file');
        $ext = $uploadedFile->getClientOriginalExtension();
        $originalName = $uploadedFile->getClientOriginalName();
        $mimeType = $uploadedFile->getMimeType();
        $size = $uploadedFile->getSize();

        // Generate disk path
        $pathInfo = $storageService->generateStoragePath($ext);

        // Move file manually or via standard Laravel. We use generated exact path
        $uploadedFile->move(dirname($pathInfo['path']), $pathInfo['name']);

        $file = File::create([
            'folder_id' => $request->folder_id,
            'original_name' => $originalName,
            'storage_name' => $pathInfo['name'],
            'storage_path' => $pathInfo['path'],
            'mime_type' => $mimeType,
            'size' => $size,
            'extension' => $ext,
        ]);

        return response()->json($file, 201);
    }

    /**
     * Init chunked upload session
     */
    public function init(Request $request)
    {
        $request->validate([
            'filename' => 'required|string',
            'size' => 'required|numeric',
            'mime_type' => 'required|string',
            'folder_id' => 'nullable|exists:folders,id',
            'total_chunks' => 'required|integer|min:1'
        ]);

        $uploadId = Str::uuid()->toString();

        // We will store session info in cache to maintain context
        cache([
            "upload_{$uploadId}" => [
                'original_name' => $request->filename,
                'size' => $request->size,
                'mime_type' => $request->mime_type,
                'folder_id' => $request->folder_id,
                'total_chunks' => $request->total_chunks,
            ]
        ], now()->addHours(24));

        return response()->json(['upload_id' => $uploadId]);
    }

    /**
     * Receive and store one chunk
     */
    public function chunk(Request $request)
    {
        $request->validate([
            'upload_id' => 'required|string',
            'chunk_index' => 'required|integer|min:0',
            'chunk' => 'required|file',
        ]);

        $uploadId = $request->upload_id;
        $session = cache("upload_{$uploadId}");

        if (!$session) {
            return response()->json(['error' => 'Upload session expired or invalid'], 404);
        }

        $tempDir = rtrim(env('STORAGE_BASE_PATH'), '/') . "/temp/{$uploadId}";
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0700, true);
        }

        $chunkPath = "{$tempDir}/chunk_{$request->chunk_index}";
        $request->file('chunk')->move($tempDir, "chunk_{$request->chunk_index}");

        UploadChunk::create([
            'upload_id' => $uploadId,
            'chunk_index' => $request->chunk_index,
            'total_chunks' => $session['total_chunks'],
            'filename' => $session['original_name'],
            'stored_at' => $chunkPath
        ]);

        return response()->json(['received' => true]);
    }

    /**
     * Assemble all chunks into final file
     */
    public function complete(Request $request, FileStorageService $storageService)
    {
        $request->validate([
            'upload_id' => 'required|string',
        ]);

        $uploadId = $request->upload_id;
        $session = cache("upload_{$uploadId}");

        if (!$session) {
            return response()->json(['error' => 'Upload session expired or invalid'], 404);
        }

        $chunks = UploadChunk::where('upload_id', $uploadId)->orderBy('chunk_index', 'asc')->get();

        if ($chunks->count() !== (int) $session['total_chunks']) {
            return response()->json(['error' => 'Missing chunks'], 422);
        }

        $ext = pathinfo($session['original_name'], PATHINFO_EXTENSION);
        $pathInfo = $storageService->generateStoragePath($ext);

        $out = @fopen($pathInfo['path'], "wb");
        if (!$out) {
            return response()->json(['error' => 'Failed to open output stream'], 500);
        }

        foreach ($chunks as $chunk) {
            $in = @fopen($chunk->stored_at, "rb");
            if ($in) {
                while ($buff = fread($in, 4096)) {
                    fwrite($out, $buff);
                }
            } else {
                fclose($out);
                unlink($pathInfo['path']);
                return response()->json(['error' => 'Failed to read chunk ' . $chunk->chunk_index], 500);
            }
            @fclose($in);
        }
        @fclose($out);

        // Clean up
        foreach ($chunks as $chunk) {
            @unlink($chunk->stored_at);
        }
        UploadChunk::where('upload_id', $uploadId)->delete();
        $tempDir = rtrim(env('STORAGE_BASE_PATH'), '/') . "/temp/{$uploadId}";
        @rmdir($tempDir);
        cache()->forget("upload_{$uploadId}");

        // Ensure final size matches
        if (filesize($pathInfo['path']) != $session['size']) {
            unlink($pathInfo['path']);
            return response()->json(['error' => "Final file size mismatch"], 500);
        }

        $file = File::create([
            'folder_id' => $session['folder_id'],
            'original_name' => $session['original_name'],
            'storage_name' => $pathInfo['name'],
            'storage_path' => $pathInfo['path'],
            'mime_type' => $session['mime_type'],
            'size' => $session['size'],
            'extension' => $ext,
        ]);

        return response()->json($file, 201);
    }

    /**
     * Cancel upload & delete chunks
     */
    public function cancel(Request $request)
    {
        $request->validate([
            'upload_id' => 'required|string',
        ]);

        $uploadId = $request->upload_id;
        $chunks = UploadChunk::where('upload_id', $uploadId)->get();

        foreach ($chunks as $chunk) {
            @unlink($chunk->stored_at);
        }
        UploadChunk::where('upload_id', $uploadId)->delete();
        $tempDir = rtrim(env('STORAGE_BASE_PATH'), '/') . "/temp/{$uploadId}";
        @rmdir($tempDir);
        cache()->forget("upload_{$uploadId}");

        return response()->json(['message' => 'Upload cancelled.']);
    }
}
