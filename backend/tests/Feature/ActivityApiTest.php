<?php

namespace Tests\Feature;

use App\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_puede_listar_actividades(): void
    {
        Activity::create(['title' => 'Comprar leche', 'status' => 'pendiente', 'priority' => 'media']);
        Activity::create(['title' => 'Pagar luz', 'status' => 'completada', 'priority' => 'alta']);

        $this->getJson('/api/activities')
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonFragment(['title' => 'Comprar leche'])
            ->assertJsonFragment(['title' => 'Pagar luz']);
    }

    public function test_puede_buscar_por_titulo(): void
    {
        Activity::create(['title' => 'Comprar leche', 'status' => 'pendiente', 'priority' => 'media']);
        Activity::create(['title' => 'Pagar luz', 'status' => 'pendiente', 'priority' => 'media']);

        $this->getJson('/api/activities?q=leche')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Comprar leche');
    }

    public function test_puede_filtrar_por_estado(): void
    {
        Activity::create(['title' => 'Tarea A', 'status' => 'pendiente', 'priority' => 'baja']);
        Activity::create(['title' => 'Tarea B', 'status' => 'completada', 'priority' => 'alta']);

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
            'status' => 'pendiente',
            'priority' => 'alta',
            'due_date' => '2026-11-30',
        ];

        $this->postJson('/api/activities', $payload)
            ->assertCreated()
            ->assertJsonPath('data.title', 'Preparar demo')
            ->assertJsonPath('data.due_date', '2026-11-30');

        $this->assertDatabaseHas('activities', [
            'title' => 'Preparar demo',
            'status' => 'pendiente',
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
        $activity = Activity::create([
            'title' => 'Ver detalle',
            'status' => 'pendiente',
            'priority' => 'media',
        ]);

        $this->getJson('/api/activities/'.$activity->id)
            ->assertOk()
            ->assertJsonPath('data.id', $activity->id)
            ->assertJsonPath('data.title', 'Ver detalle');
    }

    public function test_puede_actualizar_estado(): void
    {
        $activity = Activity::create([
            'title' => 'Actualizar',
            'status' => 'pendiente',
            'priority' => 'media',
        ]);

        $this->patchJson('/api/activities/'.$activity->id, ['status' => 'en_progreso'])
            ->assertOk()
            ->assertJsonPath('data.status', 'en_progreso');

        $this->assertDatabaseHas('activities', [
            'id' => $activity->id,
            'status' => 'en_progreso',
        ]);
    }

    public function test_puede_eliminar_actividad(): void
    {
        $activity = Activity::create([
            'title' => 'Eliminar',
            'status' => 'pendiente',
            'priority' => 'baja',
        ]);

        $this->deleteJson('/api/activities/'.$activity->id)
            ->assertOk()
            ->assertJsonPath('message', 'Actividad eliminada correctamente.');

        $this->assertDatabaseMissing('activities', ['id' => $activity->id]);
    }

    public function test_puede_filtrar_por_prioridad(): void
    {
        Activity::create(['title' => 'Urgente', 'status' => 'pendiente', 'priority' => 'alta']);
        Activity::create(['title' => 'Normal', 'status' => 'pendiente', 'priority' => 'baja']);

        $this->getJson('/api/activities?priority=alta')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Urgente');
    }

    public function test_valida_y_combina_filtros_del_listado(): void
    {
        Activity::create(['title' => 'Urgente', 'status' => 'pendiente', 'priority' => 'alta']);
        Activity::create(['title' => 'Urgente hecha', 'status' => 'completada', 'priority' => 'alta']);
        Activity::create(['title' => 'Normal', 'status' => 'pendiente', 'priority' => 'baja']);

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
}