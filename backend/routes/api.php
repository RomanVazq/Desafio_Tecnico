<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ActivityController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]);
});

Route::apiResource('activities', ActivityController::class);