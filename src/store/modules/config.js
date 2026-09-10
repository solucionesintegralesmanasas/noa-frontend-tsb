import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
    state: () => ({
        navbarStyle: 'transparent',
        theme: 'light',
        isAppLoading: false,
        loadingMessage: '',
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
        }
    }
});