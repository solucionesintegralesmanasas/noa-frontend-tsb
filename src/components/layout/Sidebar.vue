<template>
    <nav v-if="showSidebar" class="navbar navbar-light navbar-vertical navbar-expand-xl">
        <div class="d-flex align-items-center">
            <router-link class="navbar-brand" to="/dashboard">
                <div class="d-flex align-items-center py-2">
                    <img src="/noa.png" alt="NOA Transportes" width="48" class="me-2" style="height: auto; max-height: 55px;" />
                    <NoaBadge size="26px" />
                </div>
            </router-link>
        </div>

        <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
            <div class="navbar-vertical-content scrollbar">
                <ul class="navbar-nav flex-column mb-3" id="navbarVerticalNav">

                    <!-- DASHBOARD -->
                    <li class="nav-item">
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/dashboard') }" to="/dashboard"
                            role="button">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-chart-pie"></span></span>
                                <span class="nav-link-text ps-1">Dashboard</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- NOTIFICACIONES -->
                    <li class="nav-item">
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/notificaciones') }"
                            to="/notificaciones" role="button">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-bell"></span></span>
                                <span class="nav-link-text ps-1">Notificaciones</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ASISTENTE VIRTUAL -->
                    <!--  <li class="nav-item">
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/assistant') }" to="/assistant"
                            role="button">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-robot"></span></span>
                                <span class="nav-link-text ps-1">NOA Assistant</span>
                            </div>
                        </router-link>
                    </li> -->

                    <!-- ADMINISTRACIÓN -->
                    <li class="nav-item"
                        v-if="can('companies.index') || can('companies.show') || can('branches.index') || can('economic_activities.index') || can('bank_details.index') || can('tax_information.index') || can('enabling_resolutions.index') || can('conveyor_capacity.index') || can('employee.index') || can('experiences.index') || can('tax_declarations.index') || can('rup_records.index') || can('financial_statements.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Administración</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <!-- Informacion empresa -->
                        <a class="nav-link dropdown-indicator" :aria-expanded="isOpen('company')"
                            @click.prevent="toggleCollapse('company')" role="button"
                            v-if="can('companies.index') || can('companies.profile') || can('branches.index') || can('economic_activities.index') || can('bank_details.index') || can('tax_information.index') || can('enabling_resolutions.index') || can('conveyor_capacity.index') || can('employee.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-building"></span></span>
                                <span class="nav-link-text ps-1">Inf. de empresa</span>
                            </div>
                        </a>
                        <ul class="nav collapse" :class="{ show: isOpen('company') }" id="company"
                            v-if="can('companies.index') || can('companies.profile') || can('branches.index') || can('economic_activities.index') || can('bank_details.index') || can('tax_information.index') || can('enabling_resolutions.index') || can('conveyor_capacity.index') || can('employee.index')">
                            <li class="nav-item" v-if="can('companies.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresa/listas-empresa') }"
                                    to="/empresa/listas-empresa">
                                    <div class="d-flex align-items-center"><span
                                            class="nav-link-text ps-1">Empresas</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-else-if="can('companies.profile')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink(`/empresa/perfil/${userStore.company_uuid}`) }"
                                    :to="`/empresa/perfil/${userStore.company_uuid}`">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Mi
                                            empresa</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('branches.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/sucursales/listas-sucursal') }"
                                    to="/empresas/sucursales/listas-sucursal">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Sedes</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('economic_activities.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/actividades-economicas/listas-actividades-economicas') }"
                                    to="/empresas/actividades-economicas/listas-actividades-economicas">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Act.
                                            Económicas
                                        </span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('bank_details.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/datos-bancarios') }"
                                    to="/empresas/datos-bancarios">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Datos
                                            bancarios</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('tax_information.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/informacion-tributaria') }"
                                    to="/empresas/informacion-tributaria">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Info.
                                            tributaria</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('enabling_resolutions.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/resoluciones-habilitacion') }"
                                    to="/empresas/resoluciones-habilitacion">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Res.
                                            Habilitación</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('conveyor_capacity.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/capacidad-transportadora') }"
                                    to="/empresas/capacidad-transportadora">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Capacidad
                                            transp.</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('employee.index')">
                                <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/empleados') }"
                                    to="/terceros/empleados">
                                    <div class="d-flex align-items-center"><span
                                            class="nav-link-text ps-1">Empleados</span>
                                    </div>
                                </router-link>
                            </li>
                        </ul>

                        <!-- Informacion Tecninca  -->
                        <a class="nav-link dropdown-indicator" :aria-expanded="isOpen('informacion-tecnica')"
                            @click.prevent="toggleCollapse('informacion-tecnica')" role="button"
                            v-if="can('experiences.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-tools"></span></span>
                                <span class="nav-link-text ps-1">Info. Técnica</span>
                            </div>
                        </a>
                        <ul class="nav collapse" :class="{ show: isOpen('informacion-tecnica') }"
                            id="informacion-tecnica">
                            <li class="nav-item" v-if="can('experiences.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/experiencias') }"
                                    to="/empresas/experiencias">
                                    <div class="d-flex align-items-center"><span
                                            class="nav-link-text ps-1">Experiencias</span>
                                    </div>
                                </router-link>
                            </li>
                        </ul>
                        <!-- Informacion Financiera -->
                        <a class="nav-link dropdown-indicator" :aria-expanded="isOpen('informacion-financiera')"
                            @click.prevent="toggleCollapse('informacion-financiera')" role="button"
                            v-if="can('rup_records.index') || can('tax_declarations.index') || can('financial_statements.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-chart-line"></span></span>
                                <span class="nav-link-text ps-1">Info. Financiera</span>
                            </div>
                        </a>
                        <ul class="nav collapse" :class="{ show: isOpen('informacion-financiera') }"
                            id="informacion-financiera">
                            <li class="nav-item" v-if="can('rup_records.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/registro-unico-de-proponentes') }"
                                    to="/empresas/registro-unico-de-proponentes">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">RUP</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('tax_declarations.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/declaraciones-de-renta') }"
                                    to="/empresas/declaraciones-de-renta">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Decl. de
                                            renta</span>
                                    </div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('financial_statements.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/estados-financieros') }"
                                    to="/empresas/estados-financieros">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Estados
                                            financ.</span>
                                    </div>
                                </router-link>
                            </li>
                        </ul>
                    </li>

                    <!-- TERCEROS -->
                    <li class="nav-item"
                        v-if="can('customer.index') || can('supplier.index') || can('affiliate.index') || can('driver.index') || can('third_parties.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Terceros</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/afiliados') }"
                            to="/terceros/afiliados" role="button" v-if="can('affiliate.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-handshake"></span>
                                </span><span class="nav-link-text ps-1">Afiliados</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/conductores') }"
                            to="/terceros/conductores" role="button" v-if="can('driver.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-id-card"></span>
                                </span><span class="nav-link-text ps-1">Conductores</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/proveedores') }"
                            to="/terceros/proveedores" role="button" v-if="can('supplier.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-boxes"></span>
                                </span><span class="nav-link-text ps-1">Proveedores</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/clientes') }"
                            to="/terceros/clientes" role="button" v-if="can('customer.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-user-tie"></span>
                                </span><span class="nav-link-text ps-1">Clientes</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link"
                            :class="{ 'active': isActiveLink('/terceros', true) }"
                            to="/terceros" role="button" v-if="can('third_parties.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-address-book"></span>
                                </span><span class="nav-link-text ps-1">Todos (Terceros)</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/recursos-humanos/contratos-laborales/listas') }"
                            to="/recursos-humanos/contratos-laborales/listas" role="button" v-if="can('employmentContracts.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-file-contract"></span>
                                </span><span class="nav-link-text ps-1">Contratos Laborales</span>
                            </div>
                        </router-link>

                    </li>

                    <!-- SEGURIDAD -->
                    <li class="nav-item" v-if="can('users.index') || can('roles.index') || can('third_parties.index') || can('companies.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Seguridad</div>
                            <div class="col ps-0"><hr class="mb-0 navbar-vertical-divider" /></div>
                        </div>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/usuarios') }" to="/usuarios" role="button" v-if="can('users.index') || can('third_parties.index') || can('companies.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-users"></span></span><span class="nav-link-text ps-1">Usuarios</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/roles-permissions') }" to="/roles-permissions" role="button" v-if="can('roles.index') || can('companies.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-shield-alt"></span></span><span class="nav-link-text ps-1">Roles y Permisos</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- PROYECTOS -->
                    <li class="nav-item" v-if="can('projects.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Operación</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/proyectos') }"
                            to="/proyectos" role="button" v-if="can('projects.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-briefcase"></span>
                                </span><span class="nav-link-text ps-1">Proyectos</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- FLOTA -->
                    <li class="nav-item"
                        v-if="can('vehicles.index') || can('business_collaboration_agreements.index') || can('vehicle_inspections.index') || can('maintenance.index') || can('maintenance.forecast') || can('control_sheets.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Flota</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/vehiculos') }" to="/vehiculos"
                            role="button" v-if="can('vehicles.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-truck-moving"></span>
                                </span><span class="nav-link-text ps-1">Vehículos</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/convenios-colaboracion') }"
                            to="/convenios-colaboracion" role="button"
                            v-if="can('business_collaboration_agreements.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-file-signature"></span>
                                </span><span class="nav-link-text ps-1">Convenios colab.</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/inspeccion-vehiculos') }"
                            to="/inspeccion-vehiculos" role="button" v-if="can('vehicle_inspections.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-clipboard-check"></span>
                                </span><span class="nav-link-text ps-1">Inspecciones</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/mantenimiento') }"
                            to="/mantenimiento" role="button" v-if="can('maintenance.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-toolbox"></span>
                                </span><span class="nav-link-text ps-1">Mantenimientos</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/mantenimiento/proyeccion') }"
                            to="/mantenimiento/proyeccion" role="button" v-if="can('maintenance.forecast')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-calendar-check"></span>
                                </span><span class="nav-link-text ps-1">Proyección Mantenimiento</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link"
                            :class="{ 'active': isActiveLink('/planillas-de-control-de-servicios') }"
                            to="/planillas-de-control-de-servicios" role="button" v-if="can('control_sheets.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-clipboard-list"></span>
                                </span><span class="nav-link-text ps-1">Planillas de Control</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- GEOLOCALIZACIÓN -->
                    <li class="nav-item"
                        v-if="can('locations.view') || can('locations.geofences') || can('locations.history') || can('locations.alerts')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Geolocalización</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/rastreo/mapa-en-vivo') }"
                            to="/rastreo/mapa-en-vivo" role="button" v-if="can('locations.view')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-map-marked-alt"></span></span><span
                                    class="nav-link-text ps-1">Mapa en Vivo</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/rastreo') }" to="/rastreo"
                            role="button" v-if="can('locations.view')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-satellite-dish"></span></span><span
                                    class="nav-link-text ps-1">Rastreo de Conductores</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/rastreo/geocercas') }"
                            to="/rastreo/geocercas" role="button" v-if="can('locations.geofences')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-draw-polygon"></span></span><span
                                    class="nav-link-text ps-1">Geocercas</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- OPERACIONES Y FINANZAS -->
                    <li class="nav-item"
                        v-if="can('fuec.index') || can('affiliate_admin_charges.index') || can('service_delivery_control_sheets.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Operaciones y Finanzas</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/extracto-de-contrato') }"
                            to="/extracto-de-contrato" role="button" v-if="can('fuec.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-file-contract"></span>
                                </span><span class="nav-link-text ps-1">FUEC</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/pagos-de-administracion') }"
                            to="/pagos-de-administracion" role="button" v-if="can('affiliate_admin_charges.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-file-invoice-dollar"></span>
                                </span><span class="nav-link-text ps-1">Cuotas de Adm.</span>
                            </div>
                        </router-link>
                        <router-link class="nav-link"
                            :class="{ 'active': isActiveLink('/planilla-de-control-de-prestacion-servicios') }"
                            to="/planilla-de-control-de-prestacion-servicios" role="button"
                            v-if="can('service_delivery_control_sheets.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon">
                                    <span class="fas fa-file-invoice-dollar"></span>
                                </span><span class="nav-link-text ps-1">PCP</span>
                            </div>
                        </router-link>
                    </li>



                </ul>
                <div class="settings my-3"></div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, usePermissionsStore, useUserStore } from '@store';
import NoaBadge from '@/components/NoaBadge.vue';
import { useSidebar } from '@/hooks/useSidebar.js';
import { getMediaUrl } from '@/utils/media.js';

const route = useRoute();
const authStore = useAuthStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const { toggleCollapse, isOpen, isActiveLink } = useSidebar();

const isConductorRole = computed(() => {
    return permissionsStore.hasRole('CONDUCTOR');
});

const isConductorDashboard = computed(() => {
    if (route.query.view === 'admin') return false;
    if (route.path.includes('/dashboard/conductor')) return true;
    if (route.query.view === 'conductor') return true;
    return route.path === '/dashboard' && isConductorRole.value;
});

const showSidebar = computed(() => {
    if (!authStore.isAuthenticated) return false;
    if (route.meta?.hideSidebar) return false;
    if (isConductorDashboard.value) return false;
    return true;
});
const companyLogo = computed(() => getMediaUrl(userStore.logo));

const closeMobileSidebar = () => {
    const collapseEl = document.getElementById('navbarVerticalCollapse');
    if (collapseEl && collapseEl.classList.contains('show')) {
        collapseEl.classList.remove('show');
        const toggler = document.querySelector('.navbar-toggler-humburger-icon');
        if (toggler) {
            toggler.setAttribute('aria-expanded', 'false');
            toggler.classList.add('collapsed');
        }
    }
};

watch(() => route.path, () => {
    closeMobileSidebar();
});

watch(companyLogo, (newPath) => {
    console.log('Ruta del logo en Sidebar:', newPath);
}, { immediate: true });

const can = (action, subject) => permissionsStore.can(action, subject);
</script>