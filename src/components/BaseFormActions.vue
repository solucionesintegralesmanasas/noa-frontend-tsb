<template>
  <div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2 mt-4 pt-3 border-top">

    <!-- Cancelar — secundario, abajo en móvil, izquierda en desktop -->
    <button type="button" class="btn btn-outline-secondary rounded-pill px-4 w-100 w-sm-auto order-1 order-sm-0"
      :disabled="submitting" @click="$emit('cancel')">
      <i class="fas fa-times me-1"></i> Cancelar
    </button>

    <!-- Guardar / Actualizar — primario, arriba en móvil, derecha en desktop -->
    <button type="submit" class="btn btn-success rounded-pill px-5 w-100 w-sm-auto order-0 order-sm-1"
      :disabled="submitting">
      <span v-show="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
      <i v-show="!submitting" class="fas fa-check me-1"></i>
      <span v-show="submitting">Guardando...</span>
      <span v-show="!submitting">{{ isEditMode ? 'Actualizar' : 'Guardar' }}</span>
    </button>

  </div>
</template>

<script setup>
defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

defineEmits(['cancel']);
</script>