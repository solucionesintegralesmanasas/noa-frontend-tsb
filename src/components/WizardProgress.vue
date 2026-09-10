<template>
  <div class="wizard-strip mb-3">
    <div class="d-flex flex-wrap align-items-center gap-2 gap-md-3">
      <div class="wizard-steps d-flex align-items-start flex-grow-1" role="list" aria-label="Progreso del registro">
        <template v-for="(step, i) in steps" :key="step.key">
          <div class="wizard-node" :title="stepTitle(step)" role="listitem" :aria-current="step.key === current ? 'step' : undefined">
            <span class="wizard-dot" :class="stepStateClass(step)">
              <svg
                v-if="isDone(step)"
                class="wizard-check"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 12.5l5 5L20 6.5"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  pathLength="1"
                />
              </svg>
              <i v-else :class="step.icon"></i>
            </span>
            <span class="wizard-caption" :class="{ 'wizard-caption-active': step.key === current }">
              {{ step.label }}
            </span>
          </div>
          <span v-if="i < steps.length - 1" class="wizard-link" :class="{ 'wizard-link-done': isLinkDone(i) }"></span>
        </template>
      </div>

      <div class="d-flex gap-2 ms-md-auto">
        <button v-if="showSkip" type="button" class="btn btn-falcon-default btn-sm" @click="$emit('skip')">
          Omitir paso
        </button>
        <button v-if="showFinish" type="button" class="btn btn-primary btn-sm" @click="$emit('finish')">
          Terminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Stepper del asistente de documentos: nodos con icono y conector.
 * Props puras / eventos hacia arriba: no navega por sí misma.
 */
import { computed } from 'vue';
import { WIZARD_STEPS } from '@/hooks/useDocumentWizard.js';

const props = defineProps({
  current: { type: String, required: true },
  doneKeys: { type: Array, default: () => [] },
  showSkip: { type: Boolean, default: true },
  showFinish: { type: Boolean, default: true },
});

defineEmits(['skip', 'finish']);

const steps = computed(() => WIZARD_STEPS);

const orderOf = (key) => steps.value.map((s) => s.key).indexOf(key);

const isDone = (step) => props.doneKeys.includes(step.key);

const stepStateClass = (step) => {
  if (isDone(step)) return 'wizard-dot-done';
  if (step.key === props.current) return 'wizard-dot-current';
  return orderOf(step.key) < orderOf(props.current)
    ? 'wizard-dot-past'
    : 'wizard-dot-next';
};

const isLinkDone = (i) => {
  const order = steps.value.map((s) => s.key);
  return order.indexOf(props.current) > i || props.doneKeys.includes(steps.value[i].key);
};

const stepTitle = (step) => {
  if (isDone(step)) return `${step.label}: cargado`;
  if (step.key === props.current) return `${step.label}: paso actual`;
  return step.hint ? `${step.label}: ${step.hint}` : step.label;
};
</script>

<style scoped>
/* Barra de herramientas plana: el relieve lo pone la tarjeta del formulario */
.wizard-strip {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.625rem;
  padding: 0.7rem 0.9rem;
}

.wizard-steps {
  min-width: 0;
}

.wizard-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.wizard-dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border: 2px solid transparent;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.wizard-dot-current {
  background: linear-gradient(135deg, #2c7be5, #1a68d1);
  color: #fff;
  box-shadow: 0 4px 12px rgba(44, 123, 229, 0.4);
}

.wizard-dot-done {
  position: relative;
  background: rgba(44, 123, 229, 0.08);
  color: #1a68d1;
  isolation: isolate;
}

/* Anillo orbital azul: diferencia expresa frente al multicolor de la foto de perfil */
.wizard-dot-done::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #2c7be5, #00d2f4, #1a68d1, #2c7be5);
  animation: orbit-spin 5s linear infinite;
  z-index: 0;
}

.wizard-dot-done::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  background: #fff;
  z-index: 1;
}

.wizard-dot-done > * {
  position: relative;
  z-index: 2;
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Check que se dibuja al confirmar el guardado */
.wizard-check {
  width: 1.1rem;
  height: 1.1rem;
}

.wizard-check path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: check-draw 0.5s ease-out 0.1s forwards;
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.wizard-dot-past {
  background: rgba(44, 123, 229, 0.1);
  color: #1a68d1;
}

.wizard-dot-next {
  background: #eef2f7;
  color: #64748b;
}

.wizard-caption {
  font-size: 0.68rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.wizard-caption-active {
  color: #0f172a;
  font-weight: 700;
}

.wizard-link {
  flex: 1 1 1.5rem;
  min-width: 0.75rem;
  height: 2px;
  margin: 1.25rem 0.35rem 0;
  background: #e2e8f0;
  border-radius: 2px;
}

.wizard-link-done {
  background: linear-gradient(90deg, #2c7be5, #00d2f4);
}

@media (prefers-reduced-motion: reduce) {
  .wizard-dot-done::before,
  .wizard-check path {
    animation: none;
  }
  .wizard-check path {
    stroke-dashoffset: 0;
  }
}
</style>
