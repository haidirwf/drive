<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\FolderController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\StorageStatsController;

Route::post('/auth/login', [AuthController::class, 'login']);

// Public Share Routes
Route::get('/share/{token}', [ShareController::class, 'showPublic']);
Route::get('/share/{token}/download', [ShareController::class, 'downloadPublic']);

Route::middleware('auth:api')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Folders
    Route::apiResource('folders', FolderController::class)->except(['create', 'edit', 'show']);
    Route::get('/folders/{folder}/path', [FolderController::class, 'path']);

    // Files
    Route::get('/files/starred', [FileController::class, 'starred']);
    Route::get('/files/recent', [FileController::class, 'recent']);
    Route::apiResource('files', FileController::class)->except(['create', 'edit', 'store']);
    Route::get('/files/{file}/download', [FileController::class, 'download']);
    Route::get('/files/{file}/preview', [FileController::class, 'preview']);

    // Uploads
    Route::post('/upload/direct', [UploadController::class, 'direct']);
    Route::post('/upload/init', [UploadController::class, 'init']);
    Route::post('/upload/chunk', [UploadController::class, 'chunk']);
    Route::post('/upload/complete', [UploadController::class, 'complete']);
    Route::delete('/upload/cancel', [UploadController::class, 'cancel']);

    // Shares
    Route::post('/files/{file}/share', [ShareController::class, 'store']);
    Route::get('/files/{file}/shares', [ShareController::class, 'index']);
    Route::delete('/share/{token}', [ShareController::class, 'destroy']);

    // Storage
    Route::get('/storage/stats', [StorageStatsController::class, 'index']);
});
