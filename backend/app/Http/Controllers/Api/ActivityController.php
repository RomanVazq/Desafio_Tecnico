<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Activity;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\ActivityCollection;
use Illuminate\Http\JsonResponse;

class ActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): ActivityCollection
    {
        $query = Activity::query();

        if ($request->filled('q')) {
            $search = '%'.trim($request->input('q')).'%';

            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', $search)
                    ->orWhere('description', 'like', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $activities = $query
            ->orderByDesc('created_at')
            ->paginate(15);

        return new ActivityCollection($activities);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreActivityRequest $request): JsonResponse
    {
        $activity = Activity::create($request->validated());

        return (new ActivityResource($activity))
            ->additional(['message' => 'Actividad creada correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $activity = Activity::findOrFail($id);
        return new ActivityResource($activity);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateActivityRequest $request, string $id)
    {
        $activity = Activity::findOrFail($id);
        $activity->update($request->validated());

        return (new ActivityResource($activity->fresh()))
            ->additional(['message' => 'Actividad actualizada correctamente.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity): JsonResponse
    {
        $activity->delete();

        return response()->json(['message' => 'Actividad eliminada correctamente.']);
    }
}