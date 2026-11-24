<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="surface-page">
      <q-page class="not-found__page">
        <section class="not-found__card surface-card rounded-borders subtle-border">
          <div class="brand-mark not-found__mark q-mx-auto q-mb-md">
            <q-icon name="explore_off" />
          </div>

          <p class="text-caption text-muted text-mono q-ma-none">Error 404</p>
          <h1 class="not-found__title text-headline text-weight-medium text-on-surface q-ma-none">
            No encontramos esa página
          </h1>
          <p class="not-found__description text-muted q-mt-md q-mb-lg">
            La dirección que abriste no existe o cambió de lugar.
          </p>

          <q-btn
            class="not-found__action"
            unelevated
            color="primary"
            icon="arrow_back"
            label="Volver a mis tareas"
            to="/activities"
          />
        </section>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.not-found__page {
  display: flex;
  padding: max(16px, env(safe-area-inset-top)) clamp(16px, 4vw, 48px)
    max(16px, env(safe-area-inset-bottom));
}

.not-found__card {
  width: min(100%, 480px);
  margin: auto;
  padding: clamp(24px, 5vw, 48px);
  text-align: center;
}

.not-found__mark {
  width: clamp(32px, 6vw, 40px);
  height: clamp(32px, 6vw, 40px);
}

.not-found__title {
  margin-top: 8px;
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  line-height: 1.2;
}

.not-found__description {
  font-size: 1rem;
  line-height: 1.5;
}

.not-found__action {
  display: block;
  width: 100%;
  max-width: 240px;
  margin-inline: auto;
}

@media (max-width: 599px) {
  .not-found__action {
    max-width: none;
  }
}
</style>
