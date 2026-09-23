// eslint.config.js — Línea base permisiva (ARQ-016). Endurecer por fases.
// Uso: npm run lint (falla con errores; los avisos no bloquean).
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'docs/**', 'scripts/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // El repo usa `logger`; los console.* existentes se auditan aparte.
      'no-console': 'off',
      // Vistas de una palabra (HomeView, Menu...) son la convención del proyecto.
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      // args/catch no usados son ruido en este código (firmas de callbacks);
      // lo que sí se exige: sin imports ni variables muertas.
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
];
