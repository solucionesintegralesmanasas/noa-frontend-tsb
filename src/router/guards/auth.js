import { useAuthStore } from "@store/modules/auth.js";
import { useUserStore } from "@store/modules/user.js";
import { logger } from "@utils/logger.js";
import { handleGlobalError } from "@utils/error-handler.js";

// Sustituimos ROUTES por rutas directas o constantes locales
const LOGIN_ROUTE = "/login";
const DASHBOARD_ROUTE = "/dashboard";

export async function authGuard(to, from, next) {
    const authStore = useAuthStore();

    try {
        if (!authStore.isHydrated) await waitForAuthHydration(authStore);

        const isAuthenticated = authStore.isAuthenticated && authStore.accessToken;

        // Si la ruta es solo para invitados (ej: login) y ya está autenticado, enviarlo al dashboard
        if (to.meta.guestOnly && isAuthenticated) {
            return next({ path: DASHBOARD_ROUTE });
        }

        // Si la ruta es pública, permitir el paso sin requerir autenticación
        if (to.meta.public) return next();

        // Si requiere autenticación y no lo está
        if (!isAuthenticated) {
            return next({ path: LOGIN_ROUTE, query: { redirect: to.fullPath } });
        }

        if (authStore.isTokenExpired) {
            await authStore.logout({ redirect: false });
            return next(LOGIN_ROUTE);
        }

        next();
    } catch (error) {
        handleGlobalError(error, "router");
        next(LOGIN_ROUTE);
    }
}

async function waitForAuthHydration(authStore, timeoutMs = 2000) {
    if (authStore.isHydrated) return;
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(), timeoutMs);
        const unsubscribe = authStore.$subscribe((mutation, state) => {
            if (state.isHydrated) {
                clearTimeout(timer);
                unsubscribe();
                resolve();
            }
        });
    });
}