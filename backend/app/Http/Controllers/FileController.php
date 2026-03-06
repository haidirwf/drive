<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use App\Services\FileStorageService;

class FileController extends Controller
{
    /**
     * Display a listing of files.
     */
    public function index(Request $request)
    {
        $folderId = $request->query('folder_id');
        $search = $request->query('search');
        $sort = $request->query('sort', 'original_name');
        $order = $request->query('order', 'asc');

        $query = File::query();

        if ($search) {
            $query->where('original_name', 'LIKE', "%{$search}%");
        } else {
            $query->where('folder_id', $folderId);
        }

        if (in_array($sort, ['original_name', 'size', 'created_at'])) {
            $query->orderBy($sort, in_array($order, ['asc', 'desc']) ? $order : 'asc');
        }

        $files = $query->get();

        return response()->json($files);
    }

    /**
     * Display the specified file metadata.
     */
    public function show(string $id)
    {
        $file = File::findOrFail($id);
        return response()->json($file);
    }

    /**
     * Update the specified file metadata in storage.
     */
    public function update(Request $request, string $id)
    {
        $file = File::findOrFail($id);

        $validated = $request->validate([
            'original_name' => 'sometimes|string|max:500',
            'folder_id' => 'sometimes|nullable|exists:folders,id',
            'is_starred' => 'sometimes|boolean'
        ]);

        $file->update($validated);

        return response()->json($file);
    }

    /**
     * Remove the specified file from storage.
     */
    public function destroy(string $id, FileStorageService $storageService)
    {
        $file = File::findOrFail($id);

        $storageService->deleteFile($file->storage_path);
        $file->delete();

        return response()->json(['message' => 'File deleted automatically.']);
    }

    /**
     * Stream file as attachment.
     */
    public function download(string $id, FileStorageService $storageService)
    {
        $file = File::findOrFail($id);
        return $storageService->streamFile($file, false);
    }

    /**
     * Stream file inline (for preview).
     */
    public function preview(string $id, FileStorageService $storageService)
    {
        $file = File::findOrFail($id);
        return $storageService->streamFile($file, true);
    }

    /**
     * List all starred files
     */
    public function starred()
    {
        $files = File::where('is_starred', true)->orderBy('updated_at', 'desc')->get();
        return response()->json($files);
    }

    /**
     * List last 20 uploaded files.
     */
    public function recent()
    {
        $files = File::orderBy('created_at', 'desc')->take(20)->get();
        return response()->json($files);
    }
}
