<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pendiente';
    public const STATUS_IN_PROGRESS = 'en_progreso';
    public const STATUS_COMPLETED = 'completada';
    public const STATUSES = [self::STATUS_PENDING, self::STATUS_IN_PROGRESS, self::STATUS_COMPLETED];

    public const PRIORITY_LOW = 'baja';
    public const PRIORITY_MEDIUM = 'media';
    public const PRIORITY_HIGH = 'alta';
    public const PRIORITIES = [self::PRIORITY_LOW, self::PRIORITY_MEDIUM, self::PRIORITY_HIGH];

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        if (filled($filters['q'] ?? null)) {
            $search = '%'.trim($filters['q']).'%';

            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('title', 'like', $search)
                    ->orWhere('description', 'like', $search);
            });
        }

        if (filled($filters['status'] ?? null)) {
            $query->where('status', $filters['status']);
        }

        if (filled($filters['priority'] ?? null)) {
            $query->where('priority', $filters['priority']);
        }
    }
}