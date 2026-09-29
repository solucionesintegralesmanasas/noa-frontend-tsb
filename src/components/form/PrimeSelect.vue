<!-- Wrapper del proyecto sobre PrimeVue Select.
     Se importa localmente con el mismo nombre (PrimeSelect) para no tocar
     las plantillas; fija el comportamiento de todos los combobox:
     - focusOnHover=false: la lista no salta al mover el mouse.
     - autoFilterFocus=true: al abrir, el filtro recibe foco (Ctrl+V pega).
     - Enter selecciona cuando el filtro deja una sola opción.
     No usa slots: ningún uso actual los necesita. -->
<script setup>
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue';
import PrimeVueSelect from 'primevue/select';

defineOptions({ inheritAttrs: false });

const modelo = defineModel();
const emitir = defineEmits(['filter']);
const attrs = useAttrs();
const selectRef = ref(null);
const consulta = ref('');

const props = defineProps({
    options: { type: Array, default: () => [] },
    optionLabel: { type: [String, Function], default: undefined },
    optionValue: { type: [String, Function], default: undefined },
    optionGroupLabel: { type: [String, Function], default: undefined },
    optionGroupChildren: { type: [String, Function], default: undefined },
    filterFields: { type: Array, default: undefined },
    // Sin valor explícito, el filtro se activa solo en listas largas para no
    // ensuciar los combos cortos; con filtro hay búsqueda y Ctrl+V funciona.
    filter: { type: Boolean, default: undefined },
});

// Filtro efectivo: el explícito manda; si no, listas de más de 7 opciones.
const filtroActivo = computed(() => props.filter ?? ((props.options?.length ?? 0) > 7));

// Se reenvía todo salvo el filtro, que se reemite desde el wrapper para que el
// padre lo reciba una sola vez.
const attrsLimpios = computed(() => {
    const resto = { ...attrs };
    delete resto.onFilter;
    return resto;
});

/** Resuelve etiqueta o valor por clave con puntos o función (como PrimeVue). */
function resolver(origen, opcion) {
    if (typeof origen === 'function') return origen(opcion);
    if (typeof origen === 'string') {
        return origen.split('.').reduce((o, k) => (o === null || o === undefined ? o : o[k]), opcion);
    }
    return opcion;
}

const etiquetaDe = (opcion) => {
    // Sin optionLabel, PrimeVue usa `label` por defecto para objetos.
    const clave = props.optionLabel ?? 'label';
    if (typeof opcion === 'object' && opcion !== null && clave in opcion) {
        return String(resolver(clave, opcion) ?? '');
    }
    return typeof opcion === 'object' && opcion !== null ? '' : String(opcion ?? '');
};

const valorDe = (opcion) => {
    if (props.optionValue === undefined) return opcion;
    return resolver(props.optionValue, opcion);
};

/** Opciones que coinciden con el filtro actual (solo listas planas). */
function opcionesFiltradas() {
    const texto = consulta.value.trim().toLowerCase();
    const lista = props.options ?? [];
    // Agrupadas: no se intenta adivinar; se deja el comportamiento de PrimeVue.
    if (!texto || props.optionGroupChildren) return null;
    const campos = Array.isArray(props.filterFields) && props.filterFields.length ? props.filterFields : null;
    return lista.filter((opcion) => {
        const textos = campos
            ? campos.map((c) => String(opcion?.[c] ?? ''))
            : [etiquetaDe(opcion)];
        return textos.some((t) => t.toLowerCase().includes(texto));
    });
}

function alFiltrar(evento) {
    consulta.value = evento?.value ?? '';
    emitir('filter', evento);
}

// El panel de PrimeVue se teletransporta fuera del wrapper, así que un keydown
// sobre la raíz no lo alcanza: mientras el panel está abierto se escucha en
// documento (fase de captura) para interceptar el Enter antes que PrimeVue.
function alTecla(evento) {
    if (evento.key !== 'Enter') return;
    const filtradas = opcionesFiltradas();
    if (!filtradas || filtradas.length !== 1) return;
    modelo.value = valorDe(filtradas[0]);
    selectRef.value?.hide?.();
    evento.preventDefault();
    evento.stopPropagation();
}

function alMostrar() {
    document.addEventListener('keydown', alTecla, true);
}

function alOcultar() {
    document.removeEventListener('keydown', alTecla, true);
    consulta.value = '';
}

onBeforeUnmount(() => document.removeEventListener('keydown', alTecla, true));
</script>

<template>
    <PrimeVueSelect
        ref="selectRef"
        v-model="modelo"
        v-bind="attrsLimpios"
        :options="props.options"
        :optionLabel="props.optionLabel"
        :optionValue="props.optionValue"
        :optionGroupLabel="props.optionGroupLabel"
        :optionGroupChildren="props.optionGroupChildren"
        :filterFields="props.filterFields"
        :filter="filtroActivo"
        :focusOnHover="false"
        :autoFilterFocus="true"
        @filter="alFiltrar"
        @show="alMostrar"
        @hide="alOcultar"
    />
</template>
