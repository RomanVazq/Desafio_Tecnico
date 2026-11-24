<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Activity::firstOrCreate(
            ['title' => 'Revisar la lista del día'],
            [
                'status' => Activity::STATUS_PENDING,
                'priority' => Activity::PRIORITY_MEDIUM,
            ],
        );
    }
}
