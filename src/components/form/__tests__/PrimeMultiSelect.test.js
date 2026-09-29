// @vitest-environment jsdom
// PrimeMultiSelect del proyecto: fija el comportamiento sin tocar plantillas.
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeMultiSelect from '../PrimeMultiSelect.vue';

const MultiSimulado = {
    name: 'MultiSelect',
    props: ['modelValue', 'options', 'focusOnHover', 'autoFilterFocus'],
    emits: ['update:modelValue'],
    template: '<div data-test="multi"></div>',
};

describe('PrimeMultiSelect (wrapper del proyecto)', () => {
    it('fija focusOnHover en falso y autoFilterFocus en verdadero', () => {
        const wrapper = mount(PrimeMultiSelect, {
            props: { modelValue: [], options: [{ value: 'a', label: 'A' }] },
            global: { stubs: { MultiSelect: MultiSimulado } },
        });
        const interno = wrapper.findComponent(MultiSimulado);
        expect(interno.props('focusOnHover')).toBe(false);
        expect(interno.props('autoFilterFocus')).toBe(true);
    });

    it('reenvía modelo y opciones al interior', () => {
        const wrapper = mount(PrimeMultiSelect, {
            props: { modelValue: ['a'], options: [{ value: 'a', label: 'A' }] },
            global: { stubs: { MultiSelect: MultiSimulado } },
        });
        const interno = wrapper.findComponent(MultiSimulado);
        expect(interno.props('modelValue')).toEqual(['a']);
        expect(interno.props('options')).toHaveLength(1);
    });
});
