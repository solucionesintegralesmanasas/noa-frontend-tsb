<template>
  <div class="profile-photo-uploader d-flex flex-column align-items-center">
    <div class="position-relative">
      <img :src="previewSrc || fallbackSrc" :alt="label" class="rounded-3 border shadow-sm bg-white img-fluid"
        :style="{ width: sizePx, height: sizePx, objectFit: 'cover' }" />
      <label :for="inputId" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1"
        style="transform: translate(50%, 50%); width: 32px; height: 32px; cursor: pointer;">
        <i class="fas fa-camera"></i>
      </label>
    </div>
    <input type="file" :id="inputId" class="d-none" :accept="accept" @change="onChange" />
    <span class="fs-10 text-muted mt-3 fw-medium">{{ label }}</span>
  </div>
</template>

<script setup>
/**
 * Uploader reutilizable de foto de perfil con vista previa.
 * Emite el archivo seleccionado; el padre decide qué hacer con él.
 */
const props = defineProps({
  previewSrc: { type: String, default: '' },
  fallbackSrc: { type: String, default: '/assets/img/team/default.png' },
  label: { type: String, default: 'Foto de Perfil' },
  size: { type: Number, default: 120 },
  accept: { type: String, default: 'image/png, image/jpeg, image/webp' },
  inputId: { type: String, default: 'photoInput' },
});

const emit = defineEmits(['change']);

const sizePx = `${props.size}px`;

const onChange = (event) => {
  const file = event.target.files?.[0];
  if (file) emit('change', file);
};
</script>

<style scoped>
.profile-photo-uploader img {
  display: block;
}
</style>
