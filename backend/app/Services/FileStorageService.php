<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Support\Str;

class FileStorageService
{
    /**
     * Get the base storage path from the environment.
     *
     * @return string
     */
    public function getBasePath(): string
    {
        return rtrim(env('STORAGE_BASE_PATH'), '/');
    }

    /**
     * Generate the full physical disk path for a new file.
     * Example: /home/user/private_storage/files/2026/03/uuid.ext
     *
     * @param string $extension
     * @return array Contains 'path' (full disk path) and 'name' (storage name UUID.ext)
     */
    public function generateStoragePath(string $extension = ''): array
    {
        $year = date('Y');
        $month = date('m');
        $uuid = Str::uuid()->toString();

        $storageName = $extension ? "{$uuid}.{$extension}" : $uuid;

        $dir = $this->getBasePath() . "/files/{$year}/{$month}";

        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }

        return [
            'name' => $storageName,
            'path' => "{$dir}/{$storageName}"
        ];
    }

    /**
     * Delete a physical file from the disk.
     *
     * @param string $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        if (file_exists($path)) {
            return unlink($path);
        }
        return false;
    }

    /**
     * Stream a file to the browser response without loading entirely into memory.
     *
     * @param File $file
     * @param bool $inline If true, sets Content-Disposition to inline, else attachment
     * @return mixed
     */
    public function streamFile(File $file, bool $inline = false)
    {
        $path = $file->storage_path;

        if (!file_exists($path)) {
            abort(404, 'File not found on disk');
        }

        $disposition = $inline ? 'inline' : 'attachment';
        $filename = addslashes($file->original_name);

        return response()->file($path, [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
        ]);
    }
}
