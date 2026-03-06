<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('folder_id')->nullable()->constrained('folders')->onDelete('set null');
            $table->string('original_name', 500);
            $table->string('storage_name', 255)->unique();
            $table->string('storage_path', 1000);
            $table->string('mime_type', 100);
            $table->bigInteger('size')->unsigned();
            $table->string('extension', 20)->nullable();
            $table->boolean('is_starred')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
