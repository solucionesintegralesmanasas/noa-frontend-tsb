// @vitest-environment jsdom
// Comportamiento fijado del combobox del proyecto: v-model conectado al Select
// interno, sin salto por hover, foco automático del filtro (pegar funciona) y
// Enter que toma la opción única mientras el panel está abierto.
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import PrimeSelect from '../PrimeSelect.vue';

// Doble del Select de PrimeVue: expone props y reemite eventos.
const SelectSimulado = {
    name: 'Select',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'focusOnHover', 'autoFilterFocus'],
    emits: ['update:modelValue', 'filter', 'show', 'hide', 'keydown'],
    render() {
        return h('input', {
            'data-test': 'filtro',
            onInput: (e) => this.$emit('filter', { value: e.target.value }),
            onKeydown: (e) => this.$emit('keydown', e),
        });
    },
};

const opciones = [
    { uuid: 'a1', description: 'Toyota' },
    { uuid: 'b2', description: 'Chevrolet' },
    { uuid: 'c3', description: 'Mazda' },
];

function montar(props = {}) {
    return mount(PrimeSelect, {
        props: {
            modelValue: null,
            options: opciones,
            optionLabel: 'description',
            optionValue: 'uuid',
            filter: true,
            ...props,
        },
        global: { stubs: { Select: SelectSimulado } },
    });
}

const interno = (wrapper) => wrapper.findComponent(SelectSimulado);

async function abrir(wrapper) {
    interno(wrapper).vm.$emit('show');
    await wrapper.vm.$nextTick();
}

async function filtrar(wrapper, texto) {
    interno(wrapper).vm.$emit('filter', { value: texto });
    await wrapper.vm.$nextTick();
}

function enterEnDocumento() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

afterEach(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
});

describe('PrimeSelect (wrapper del proyecto)', () => {
    it('fija focusOnHover en falso y autoFilterFocus en verdadero', () => {
        const wrapper = montar();
        expect(interno(wrapper).props('focusOnHover')).toBe(false);
        expect(interno(wrapper).props('autoFilterFocus')).toBe(true);
    });

    it('conecta el v-model del padre con el Select interno', async () => {
        const wrapper = montar({ modelValue: 'b2' });
        expect(interno(wrapper).props('modelValue')).toBe('b2');

        // La selección del interior sube al padre a través del wrapper.
        interno(wrapper).vm.$emit('update:modelValue', 'c3');
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe('c3');
    });

    it('Enter selecciona cuando el filtro deja una sola opción', async () => {
        const wrapper = montar();
        await abrir(wrapper);
        await filtrar(wrapper, 'mazd');
        enterEnDocumento();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe('c3');
    });

    it('Enter no cambia nada con varias opciones', async () => {
        const wrapper = montar();
        await abrir(wrapper);
        await filtrar(wrapper, 'o');
        enterEnDocumento();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('Enter no cambia nada sin filtrar', async () => {
        const wrapper = montar();
        await abrir(wrapper);
        enterEnDocumento();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('no intenta adivinar en listas agrupadas', async () => {
        const wrapper = montar({
            options: [{ grupo: 'G', items: opciones }],
            optionGroupLabel: 'grupo',
            optionGroupChildren: 'items',
        });
        await abrir(wrapper);
        await filtrar(wrapper, 'mazd');
        enterEnDocumento();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('usa `label` como etiqueta por defecto en objetos', async () => {
        const wrapper = montar({
            optionLabel: undefined,
            optionValue: undefined,
            options: [{ label: 'Única', value: 'x' }],
        });
        await abrir(wrapper);
        await filtrar(wrapper, 'únic');
        enterEnDocumento();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual({ label: 'Única', value: 'x' });
    });

    it('al cerrar deja de escuchar Enter y limpia la consulta', async () => {
        const wrapper = montar();
        await abrir(wrapper);
        await filtrar(wrapper, 'mazd');
        interno(wrapper).vm.$emit('hide');
        await wrapper.vm.$nextTick();
        enterEnDocumento();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('reemite el evento filter al padre', async () => {
        const wrapper = montar();
        await filtrar(wrapper, 'toy');
        expect(wrapper.emitted('filter')[0][0]).toEqual({ value: 'toy' });
    });
});
