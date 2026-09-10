import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
    state: () => ({
        navbarStyle: 'transparent',
        theme: 'light',
        isAppLoading: false,
        loadingMessage: '',
        isNavigating: false,
        _navTimer: null,
    }),

    actions: {
        setNavbarStyle(style) {
            this.navbarStyle = style;
        },
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
        },
        setLoading(status, message = '') {
            this.isAppLoading = status;
            this.loadingMessage = message;
        },
        startNavigation() {
            // Umbral de 80ms: solo muestra barra si la navegación es perceptiblemente lenta
            this._navTimer = setTimeout(() => {
                this.isNavigating = true;
            }, 80);
        },
        endNavigation() {
            clearTimeout(this._navTimer);
            this._navTimer = null;
            this.isNavigating = false;
        }
    }
});