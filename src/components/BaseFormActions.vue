<template>
  <div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2 mt-4 pt-3 border-top">

    <!-- Cancelar / Anterior — secundario, abajo en móvil, izquierda en desktop -->
    <button type="button" class="btn btn-outline-secondary rounded-pill px-3 w-100 w-sm-auto order-1 order-sm-0"
      :disabled="submitting" @click="$emit('cancel')">
      <i :class="wizardMode ? 'fas fa-arrow-left me-1' : 'fas fa-times me-1'" aria-hidden="true"></i> {{ wizardMode ? 'Anterior' : 'Cancelar' }}
    </button>

    <!-- Guardar / Actualizar — primario, arriba en móvil, derecha en desktop -->
    <button type="submit" class="btn btn-success rounded-pill px-4 shadow-sm w-100 w-sm-auto order-0 order-sm-1"
      :disabled="submitting" :aria-busy="submitting">
      <span v-show="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
      <i v-show="!submitting" class="fas fa-check me-1" aria-hidden="true"></i>
      <span aria-live="polite">
        <span v-show="submitting">Guardando...</span>
        <span v-show="!submitting">{{ submitLabel }}</span>
      </span>
    </button>

  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  wizardMode: {
    type: Boolean,
    default: false
  }
});

defineEmits(['cancel']);

// En modo asistente (?wizard=) Guardar avanza al siguiente paso:
// la etiqueta lo deja explícito para no confundir con un guardado final.
const submitLabel = computed(() => {
  if (props.isEditMode) return 'Actualizar';
  return props.wizardMode ? 'Guardar y continuar' : 'Guardar';
});
</script>

<style scoped>
.btn:focus-visible {
  outline: 2px solid #2c7be5;
  outline-offset: 2px;
}
</style>