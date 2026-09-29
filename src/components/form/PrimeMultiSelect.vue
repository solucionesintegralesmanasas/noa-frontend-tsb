<!-- Wrapper del proyecto sobre PrimeVue MultiSelect.
     Se importa localmente con el mismo nombre (PrimeMultiSelect).
     Fija focusOnHover=false (la lista no salta al mover el mouse) y
     autoFilterFocus=true (si hay filtro, Ctrl+V pega al abrir). -->
<script setup>
import PrimeVueMultiSelect from 'primevue/multiselect';

defineOptions({ inheritAttrs: false });
</script>

<template>
    <PrimeVueMultiSelect
        v-bind="$attrs"
        :focusOnHover="false"
        :autoFilterFocus="true"
    />
</template>
