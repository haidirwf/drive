<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\FileStorageService;

class FolderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $parentId = $request->query('parent_id');

        $folders = Folder::where('parent_id', $parentId)->orderBy('name', 'asc')->get();

        return response()->json($folders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
        ]);

        $parent = null;
        $path = '/' . $request->name;

        if ($request->parent_id) {
            $parent = Folder::find($request->parent_id);
            $path = $parent->path . '/' . $request->name;
        }

        // Check for duplicate name in same logical directory
        if (Folder::where('parent_id', $request->parent_id)->where('name', $request->name)->exists()) {
            return response()->json(['error' => 'A folder with this name already exists in this location.'], 422);
        }

        $folder = Folder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'path' => $path
        ]);

        return response()->json($folder, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $folder = Folder::findOrFail($id);

        // Check duplicate
        if (
            Folder::where('parent_id', $folder->parent_id)
                ->where('name', $request->name)
                ->where('id', '!=', $id)
                ->exists()
        ) {
            return response()->json(['error' => 'A folder with this name already exists.'], 422);
        }

        $oldPath = $folder->path;
        $newPath = $folder->parent ? $folder->parent->path . '/' . $request->name : '/' . $request->name;

        $folder->update([
            'name' => $request->name,
            'path' => $newPath
        ]);

        // We would ideally need to update all descendants' paths, but relying on recursive SQL or 
        // a simple queue job in a real app. For this single-user simple app, we can do it recursively.
        $this->updateDescendantPaths($folder, $oldPath, $newPath);

        return response()->json($folder);
    }

    private function updateDescendantPaths(Folder $folder, $oldPrefix, $newPrefix)
    {
        // For simplicity and to avoid too many queries, get all children and replace prefix
        $descendants = Folder::where('path', 'like', $oldPrefix . '/%')->get();
        foreach ($descendants as $desc) {
            $desc->path = preg_replace('/^' . preg_quote($oldPrefix, '/') . '/', $newPrefix, $desc->path, 1);
            $desc->save();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, FileStorageService $storageService)
    {
        $folder = Folder::findOrFail($id);

        // Get all descendant folders including self
        $allFolderIds = Folder::where('path', 'like', $folder->path . '/%')
            ->orWhere('id', $folder->id)
            ->pluck('id');

        // Get all files in these folders
        $files = \App\Models\File::whereIn('folder_id', $allFolderIds)->get();

        foreach ($files as $file) {
            $storageService->deleteFile($file->storage_path);
            $file->delete();
        }

        $folder->delete(); // Cascades to children in DB if configured, but we do it manually anyway or rely on DB FK cascade

        return response()->json(['message' => 'Folder and all contents deleted.']);
    }

    /**
     * Return breadcrumb array for a folder.
     */
    public function path(string $id)
    {
        $folder = Folder::findOrFail($id);
        $breadcrumbs = [];

        $current = $folder;
        while ($current) {
            array_unshift($breadcrumbs, [
                'id' => $current->id,
                'name' => $current->name
            ]);
            $current = $current->parent;
        }

        return response()->json($breadcrumbs);
    }
}
