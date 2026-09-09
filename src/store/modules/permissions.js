import { defineStore } from "pinia";
import { rbac } from "@services/security/permissions/rbac.js";
import { defineAbilities } from "@services/security/permissions/abilities.js";
import { logger } from "@utils/logger.js";
import { permissionsPersistencePlugin } from "@store/plugins/persistence.js";

export const usePermissionsStore = defineStore("permissions", {
    state: () => ({
        user: null,
        roles: [],
        permissions: [],
        abilities: {},
        isLoaded: false,
        isHydrated: false,
    }),

    actions: {
        setUser(user) {
            this.user = user;
            this.roles = Array.isArray(user.roles) ? user.roles : Object.values(user.roles || {});
            this.permissions = Array.isArray(user.permissions) ? user.permissions : Object.values(user.permissions || {});

            rbac.setUser({ ...user, roles: this.roles, permissions: this.permissions });
            this.abilities = defineAbilities({ roles: this.roles, permissions: this.permissions });
            this.isLoaded = true;
        },

        async load() {
            if (this.isLoaded) return;
            const { authService } = await import("@services/api/auth.service.js");
            const { user } = await authService.getProfile();
            this.setUser(user);
        },

        can(action, subject = null) {
            if (this.roles.includes('super_admin') || this.roles.includes('Administrador') || this.roles.includes('Super Administrador') || this.roles.includes('SUPERADMIN')) {
                return true;
            }
            
            let permissionName = action;
            if (subject) {
                permissionName = `${subject}.${action}`;
            }
            
            return this.permissions.includes(permissionName) || rbac.can(action, subject);
        },

        clear() {
            this.$reset();
            rbac.clearUser();
        }
    },
    persist: { plugins: [permissionsPersistencePlugin] }
});