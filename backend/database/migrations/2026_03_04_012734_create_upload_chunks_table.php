<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('upload_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('upload_id', 64);
            $table->integer('chunk_index')->unsigned();
            $table->integer('total_chunks')->unsigned();
            $table->string('filename', 500);
            $table->string('stored_at', 1000);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upload_chunks');
    }
};
