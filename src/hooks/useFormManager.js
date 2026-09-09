// src/hooks/useFormManager.js
import { reactive, ref } from 'vue';

/**
 * Hook para gestionar formularios con validación básica y loading.
 */
export function useFormManager(initialState = {}, validationSchema = {}) {
    const formData = reactive({ ...initialState });
    const errors = reactive({});
    const isSubmitting = ref(false);

    const validate = () => {
        Object.keys(errors || {}).forEach(key => delete errors[key]);
        const newErrors = {};
        Object.keys(validationSchema || {}).forEach(key => {
            if (validationSchema[key]?.required && !formData[key]) {
                const labelName = key === 'email' ? 'El correo electrónico' : key === 'password' ? 'La contraseña' : `El campo ${key.replace('_', ' ')}`;
                newErrors[key] = `${labelName} es obligatorio`;
            }
        });
        Object.assign(errors, newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const reset = () => {
        Object.assign(formData, initialState || {});
        Object.keys(errors || {}).forEach(key => delete errors[key]);
    };

    return { formData, errors, isSubmitting, validate, reset };
}