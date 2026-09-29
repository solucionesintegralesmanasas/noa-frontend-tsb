<!-- Entrada de fecha del proyecto: un input type="date" nativo que además
     acepta pegar (y escribir) fechas como 14/09/2026 y las normaliza a ISO.
     Es reemplazo directo del nativo: todo lo demás (id, class, aria,
     required, placeholder) se reenvía tal cual. -->
<script setup>
import { ref } from 'vue';
import { parsearFechaFlexible } from '@/utils/date.js';

const modelo = defineModel();
const props = defineProps({
    id: { type: String, default: undefined },
});
const inputRef = ref(null);

function alEscribir(evento) {
    modelo.value = evento.target.value || null;
}

function alPegar(evento) {
    const texto = evento.clipboardData?.getData('text') ?? '';
    const iso = parsearFechaFlexible(texto);
    if (!iso) return;
    // Fecha válida pegada desde otro formato (p. ej. páginas del gobierno):
    // se fija el ISO y se avisa como escritura + cambio para que las
    // validaciones (@input/@change/@blur del padre) reaccionen igual.
    evento.preventDefault();
    modelo.value = iso;
    if (inputRef.value) {
        inputRef.value.value = iso;
        inputRef.value.dispatchEvent(new Event('input', { bubbles: true }));
        inputRef.value.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
</script>

<template>
    <input
        ref="inputRef"
        type="date"
        :id="props.id"
        :value="modelo ?? ''"
        v-bind="$attrs"
        @input="alEscribir"
        @paste="alPegar"
    />
</template>
