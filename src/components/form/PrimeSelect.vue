<!-- Wrapper del proyecto sobre PrimeVue Select.
     Se importa localmente con el mismo nombre (PrimeSelect) para no tocar
     las plantillas; fija el comportamiento de todos los combobox:
     - focusOnHover=false: la lista no salta al mover el mouse.
     - autoFilterFocus=true: al abrir, el filtro recibe foco (Ctrl+V pega).
     - Enter selecciona cuando el filtro deja una sola opción.
     No usa slots: ningún uso actual los necesita. -->
<script setup>
import { computed, ref, useAttrs } from 'vue';
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
});

// Se reenvía todo salvo lo interceptado (filter/keydown/hide), que se
// llama a mano para no duplicar ni perder el listener del padre.
const attrsLimpios = computed(() => {
    const resto = { ...attrs };
    delete resto.onFilter;
    delete resto.onKeydown;
    delete resto.onHide;
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
    if (props.optionLabel === undefined) {
        return typeof opcion === 'object' && opcion !== null ? '' : String(opcion ?? '');
    }
    return String(resolver(props.optionLabel, opcion) ?? '');
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

function alOcultar(evento) {
    consulta.value = '';
    if (typeof attrs.onHide === 'function') attrs.onHide(evento);
}

function alTecla(evento) {
    if (evento.key === 'Enter') {
        const filtradas = opcionesFiltradas();
        if (filtradas && filtradas.length === 1) {
            const valor = valorDe(filtradas[0]);
            const actual = modelo.value;
            const igual = JSON.stringify(actual) === JSON.stringify(valor) || actual === valor;
            if (!igual) {
                modelo.value = valor;
                selectRef.value?.hide?.();
                evento.preventDefault();
                evento.stopPropagation();
                return;
            }
        }
    }
    if (typeof attrs.onKeydown === 'function') attrs.onKeydown(evento);
}
</script>

<template>
    <PrimeVueSelect
        ref="selectRef"
        v-bind="attrsLimpios"
        :options="props.options"
        :optionLabel="props.optionLabel"
        :optionValue="props.optionValue"
        :optionGroupLabel="props.optionGroupLabel"
        :optionGroupChildren="props.optionGroupChildren"
        :filterFields="props.filterFields"
        :focusOnHover="false"
        :autoFilterFocus="true"
        @filter="alFiltrar"
        @keydown.capture="alTecla"
        @hide="alOcultar"
    />
</template>
