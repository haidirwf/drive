<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate([
            'email' => 'admin@drivex.local'
        ], [
            'name' => env('STORAGE_USERNAME', 'admin'),
            'password' => env('STORAGE_PASSWORD_HASH')
        ]);
    }
}
