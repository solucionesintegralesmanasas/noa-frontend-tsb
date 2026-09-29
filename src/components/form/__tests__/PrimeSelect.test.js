// @vitest-environment jsdom
// Comportamiento fijado del combobox del proyecto: sin salto por hover,
// foco automático del filtro (pegar funciona) y Enter que toma la opción única.
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import PrimeSelect from '../PrimeSelect.vue';

// Doble del Select de PrimeVue: expone props y reemite filtro/teclado/ocultar.
const SelectSimulado = {
    name: 'Select',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'focusOnHover', 'autoFilterFocus'],
    emits: ['update:modelValue', 'filter', 'hide', 'keydown'],
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

function montar(props = {}, attrs = {}) {
    return mount(PrimeSelect, {
        props: {
            modelValue: null,
            options: opciones,
            optionLabel: 'description',
            optionValue: 'uuid',
            filter: true,
            ...props,
        },
        attrs,
        global: { stubs: { Select: SelectSimulado } },
    });
}

async function escribir(wrapper, texto) {
    const input = wrapper.find('[data-test="filtro"]');
    await input.setValue(texto);
}

async function enter(wrapper) {
    await wrapper.find('[data-test="filtro"]').trigger('keydown', { key: 'Enter' });
}

describe('PrimeSelect (wrapper del proyecto)', () => {
    it('fija focusOnHover en falso y autoFilterFocus en verdadero', () => {
        const wrapper = montar();
        const interno = wrapper.findComponent(SelectSimulado);
        expect(interno.props('focusOnHover')).toBe(false);
        expect(interno.props('autoFilterFocus')).toBe(true);
    });

    it('Enter selecciona cuando el filtro deja una sola opción', async () => {
        const wrapper = montar();
        await escribir(wrapper, 'mazd');
        await enter(wrapper);
        const emitido = wrapper.emitted('update:modelValue');
        expect(emitido).toBeTruthy();
        expect(emitido.at(-1)[0]).toBe('c3');
    });

    it('Enter no cambia nada con varias opciones', async () => {
        const wrapper = montar();
        await escribir(wrapper, 'o');
        await enter(wrapper);
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('Enter no cambia nada sin filtrar', async () => {
        const wrapper = montar();
        await enter(wrapper);
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('no intenta adivinar en listas agrupadas', async () => {
        const wrapper = montar({
            options: [{ grupo: 'G', items: opciones }],
            optionGroupLabel: 'grupo',
            optionGroupChildren: 'items',
        });
        await escribir(wrapper, 'mazd');
        await enter(wrapper);
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('ocultar limpia la consulta anterior', async () => {
        const wrapper = montar();
        await escribir(wrapper, 'mazd');
        wrapper.findComponent(SelectSimulado).vm.$emit('hide');
        await wrapper.vm.$nextTick();
        await enter(wrapper);
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('reemite el evento filter al padre', async () => {
        const wrapper = montar();
        await escribir(wrapper, 'toy');
        expect(wrapper.emitted('filter')).toBeTruthy();
        expect(wrapper.emitted('filter')[0][0]).toEqual({ value: 'toy' });
    });
});
