<?php

namespace Tests\Feature;

use App\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityApiTest extends TestCase
{
    use RefreshDatabase;

    private function createActivity(array $attributes = []): Activity
    {
        return Activity::create(array_merge([
            'title' => 'Tarea de prueba',
            'status' => Activity::STATUS_PENDING,
            'priority' => Activity::PRIORITY_MEDIUM,
        ], $attributes));
    }

    public function test_puede_listar_actividades(): void
    {
        $this->createActivity(['title' => 'Comprar leche']);
        $this->createActivity([
            'title' => 'Pagar luz',
            'status' => Activity::STATUS_COMPLETED,
            'priority' => Activity::PRIORITY_HIGH,
        ]);

        $this->getJson('/api/activities')
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonFragment(['title' => 'Comprar leche'])
            ->assertJsonFragment(['title' => 'Pagar luz']);
    }

    public function test_puede_buscar_por_titulo(): void
    {
        $this->createActivity(['title' => 'Comprar leche']);
        $this->createActivity(['title' => 'Pagar luz']);

        $this->getJson('/api/activities?q=leche')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Comprar leche');
    }

    public function test_puede_filtrar_por_estado(): void
    {
        $this->createActivity(['title' => 'Tarea A', 'priority' => Activity::PRIORITY_LOW]);
        $this->createActivity([
            'title' => 'Tarea B',
            'status' => Activity::STATUS_COMPLETED,
            'priority' => Activity::PRIORITY_HIGH,
        ]);

        $this->getJson('/api/activities?status=completada')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Tarea B');
    }

    public function test_puede_crear_actividad(): void
    {
        $payload = [
            'title' => 'Preparar demo',
            'description' => 'Cargar capturas',
            'status' => Activity::STATUS_PENDING,
            'priority' => Activity::PRIORITY_HIGH,
            'due_date' => '2026-11-30',
        ];

        $this->postJson('/api/activities', $payload)
            ->assertCreated()
            ->assertJsonPath('data.title', 'Preparar demo')
            ->assertJsonPath('data.due_date', '2026-11-30');

        $this->assertDatabaseHas('activities', [
            'title' => 'Preparar demo',
            'status' => Activity::STATUS_PENDING,
        ]);
    }

    public function test_puede_crear_actividad_sin_fecha_limite(): void
    {
        $this->postJson('/api/activities', [
            'title' => 'Sin fecha límite',
            'status' => Activity::STATUS_PENDING,
            'priority' => Activity::PRIORITY_LOW,
        ])
            ->assertCreated()
            ->assertJsonPath('data.due_date', null);

        $this->assertDatabaseHas('activities', [
            'title' => 'Sin fecha límite',
            'due_date' => null,
        ]);
    }

    public function test_valida_datos_al_crear(): void
    {
        $this->postJson('/api/activities', [
            'title' => '',
            'status' => 'invalido',
            'priority' => 'urgente',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'status', 'priority']);
    }

    public function test_puede_ver_detalle(): void
    {
        $activity = $this->createActivity(['title' => 'Ver detalle']);

        $this->getJson('/api/activities/'.$activity->id)
            ->assertOk()
            ->assertJsonPath('data.id', $activity->id)
            ->assertJsonPath('data.title', 'Ver detalle');
    }

    public function test_devuelve_404_si_la_actividad_no_existe(): void
    {
        $this->getJson('/api/activities/999')->assertNotFound();
    }

    public function test_puede_actualizar_estado(): void
    {
        $activity = $this->createActivity(['title' => 'Actualizar']);

        $this->patchJson('/api/activities/'.$activity->id, ['status' => Activity::STATUS_IN_PROGRESS])
            ->assertOk()
            ->assertJsonPath('data.status', Activity::STATUS_IN_PROGRESS);

        $this->assertDatabaseHas('activities', [
            'id' => $activity->id,
            'status' => Activity::STATUS_IN_PROGRESS,
        ]);
    }

    public function test_puede_eliminar_actividad(): void
    {
        $activity = $this->createActivity(['title' => 'Eliminar', 'priority' => Activity::PRIORITY_LOW]);

        $this->deleteJson('/api/activities/'.$activity->id)
            ->assertOk()
            ->assertJsonPath('message', 'Actividad eliminada correctamente.');

        $this->assertDatabaseMissing('activities', ['id' => $activity->id]);
    }

    public function test_puede_filtrar_por_prioridad(): void
    {
        $this->createActivity(['title' => 'Urgente', 'priority' => Activity::PRIORITY_HIGH]);
        $this->createActivity(['title' => 'Normal', 'priority' => Activity::PRIORITY_LOW]);

        $this->getJson('/api/activities?priority=alta')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Urgente');
    }

    public function test_valida_y_combina_filtros_del_listado(): void
    {
        $this->createActivity(['title' => 'Urgente', 'priority' => Activity::PRIORITY_HIGH]);
        $this->createActivity([
            'title' => 'Urgente hecha',
            'status' => Activity::STATUS_COMPLETED,
            'priority' => Activity::PRIORITY_HIGH,
        ]);
        $this->createActivity(['title' => 'Normal', 'priority' => Activity::PRIORITY_LOW]);

        $this->getJson('/api/activities?status=pendiente&priority=alta')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Urgente');

        $this->getJson('/api/activities?status=invalido')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->getJson('/api/activities?priority=invalida')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['priority']);
    }

    public function test_pagina_el_listado(): void
    {
        for ($i = 1; $i <= 16; $i++) {
            $this->createActivity(['title' => 'Tarea '.$i]);
        }

        $this->getJson('/api/activities?page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.total', 16);
    }
}
