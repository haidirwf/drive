<?php

use Illuminate\Support\Facades\Route;

// All non-api routes should serve the React SPA
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');
