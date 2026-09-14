<template>
    <BasePageHeader title="Hojas de Control de Servicio"
        description="Gestión de las planillas de control de prestación de servicios."
        icon="fad fa-clipboard-list text-primary" :show-bg="true" :loading="isViewLoading || store.loading"
        :compact="true" :breadcrumbs="[{ label: 'Hojas de Control' }, { label: 'Listado' }]">
        <template #actions>
            <!-- REFRESH -->
            <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Actualizar"
                @click="refreshTable">
                <i class="fad fa-sync"></i>
                <span class="d-none d-sm-inline ms-1">Actualizar</span>
            </button>

            <!-- PLANILLA MENSUAL -->
            <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Reporte Mensual"
                @click="openMonthlyDialog">
                <i class="fad fa-file-invoice text-success"></i>
                <span class="d-none d-sm-inline ms-1">Planilla Mensual</span>
            </button>

            <!-- VER HISTORIAL -->
            <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Historial"
                @click="openHistoryDialog">
                <i class="fad fa-history text-warning"></i>
                <span class="d-none d-sm-inline ms-1">Ver Historial</span>
            </button>

            <!-- CREATE -->
            <button v-if="permissionsStore.can('service_delivery_control_sheets.create') && !permissionsStore.hasRole('CONDUCTOR')"
                class="btn btn-primary btn-sm px-2 px-sm-3" type="button" title="Nuevo registro" @click="goToCreate">
                <i class="fad fa-plus"></i>
                <span class="d-none d-sm-inline ms-1">Nuevo</span>
            </button>

            <!-- CUSTOM: Control de Servicios -->
            <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Control de Servicios"
                @click="goToInternalControl">
                <i class="fad fa-clipboard-check"></i>
                <span class="d-none d-sm-inline ms-1">Control de Servicios</span>
            </button>
        </template>
    </BasePageHeader>

    <!-- BARRA DE BÚSQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div
                class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2">
                <!-- Izquierda: título + input -->
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda Rápida</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar por ruta, vehículo, conductor..."
                            @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
                </div>
                <!-- Centro: filtro proyecto -->
                <div class="d-flex align-items-center gap-2 w-100" style="max-width: 340px;">
                    <i class="fad fa-briefcase text-muted" />
                    <select v-model="projectFilter" class="form-select form-select-sm" @change="onProjectFilterChange">
                        <option value="">Todos los proyectos</option>
                        <option v-for="p in store.projects" :key="p.uuid" :value="p.uuid">{{ p.project_name }}</option>
                    </select>
                </div>
                <!-- Derecha: contador -->
                <div v-if="!isViewLoading && !store.loading" class="text-muted text-nowrap">
                    <small>
                        <i class="fad fa-filter me-1" />
                        {{ store.pagination.totalItems }} resultado{{
                            store.pagination.totalItems !== 1 ? "s" : ""
                        }}
                        <span v-if="store.search"> para "{{ store.search }}"</span>
                    </small>
                </div>
            </div>
        </div>
    </div>

    <!-- TABLA -->
    <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="bg-holder d-none d-lg-block bg-card"
                    style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />

                <!-- SKELETON -->
                <div v-if="isViewLoading" class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th v-for="w in ['30%', '20%', '20%', '15%', '15%']" :key="w"
                                        style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td v-for="i in 4" :key="i">
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
                                    </td>
                                    <td>
                                        <div class="d-flex justify-content-center gap-1">
                                            <div v-for="j in 3" :key="j" class="skeleton-icon"
                                                style="height:28px;width:28px;" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- DATATABLE (Paginación Server-Side) -->
                <div v-else class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">

                            <Column header="Proyecto">
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.project?.project_name || '-' }}</span>
                                </template>
                            </Column>

                            <Column header="Vehículo / Conductor">
                                <template #body="{ data }">
                                    <div class="d-flex flex-column">
                                        <span class="text-dark fw-semibold">{{ data.vehicle_license_plate || '-' }}</span>
                                        <small class="text-muted">{{ data.driver_name || data.official_name_and_surname || '' }}</small>
                                    </div>
                                </template>
                            </Column>

                            <Column header="Recorridos">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle-info">
                                        {{ recorridosCount(data) }} recorrido{{ recorridosCount(data) !== 1 ? 's' : '' }}
                                    </span>
                                    <div class="small text-muted mt-1" style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="recorridosTexto(data)">
                                        {{ recorridosTexto(data) }}
                                    </div>
                                </template>
                            </Column>

                            <Column header="Tipo">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle-secondary" style="font-size: 0.65rem;">
                                        {{ tipoLabel(data.type_of_control_sheet) }}
                                    </span>
                                </template>
                            </Column>

                            <Column field="start_date" header="Fecha de inicio" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ formatRango(data.start_date || data.service_date) || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="end_date" header="Fecha de fin" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ formatRango(data.end_date || data.service_date) || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="control_status" header="Estado" sortable class="text-center"
                                style="width: 120px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle" :class="estadoBadge(data)">
                                        <i :class="estadoIcono(data)" style="font-size:10px;" />
                                        {{ estadoLabel(data) }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="min-width:205px; width: 205px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button v-if="permissions.view" class="btn btn-falcon-default" type="button"
                                            title="Ver detalle" @click="goToDetail(data.uuid)">
                                            <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                        </button>
                                        <button class="btn btn-falcon-default" type="button"
                                            title="Descargar PDF Diario" @click="downloadDaily(data.uuid)"
                                            :disabled="downloadingDaily === data.uuid">
                                            <span v-if="downloadingDaily === data.uuid"
                                                class="spinner-border spinner-border-sm text-danger"
                                                style="width: 14px; height: 14px;"></span>
                                            <i v-else class="fad fa-file-pdf text-danger" style="font-size:14px;" />
                                        </button>
                                        <button v-if="canShareCoordinatorLink && !isServicioCerrado(data)" class="btn btn-falcon-default" type="button"
                                            title="Compartir firma del coordinador (1 hora)" @click="shareCoordinatorLink(data.uuid)"
                                            :disabled="sharingLink === data.uuid">
                                            <span v-if="sharingLink === data.uuid"
                                                class="spinner-border spinner-border-sm text-primary"
                                                style="width: 14px; height: 14px;"></span>
                                            <i v-else class="fad fa-share-alt text-primary" style="font-size:14px;" />
                                        </button>
                                        <button v-if="!isServicioCerrado(data)" class="btn btn-falcon-default" type="button"
                                            title="Continuar servicio" @click="goToControl(data.uuid)">
                                            <i class="fad fa-steering-wheel text-success" style="font-size:14px;" />
                                        </button>
                                        <button v-if="permissions.edit && !isServicioCerrado(data)" class="btn btn-falcon-default" type="button"
                                            title="Editar" @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button v-if="permissions.delete && !isServicioCerrado(data)" class="btn btn-falcon-default" type="button"
                                            title="Eliminar" @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>
                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando datos..." />
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- DIÁLOGO MENSUAL E HISTORIAL -->
    <Dialog v-model:visible="showReportDialog" :modal="true" :closable="true" :draggable="false"
        :style="{ width: '520px' }" class="p-fluid report-dialog">
        <template #header>
            <div class="d-flex align-items-center gap-2">
                <i
                    :class="[dialogMode === 'history' ? 'fad fa-history text-warning' : 'fad fa-file-invoice text-success', 'fs-4']"></i>
                <h5 class="mb-0 fw-bold text-slate-800">
                    {{ dialogMode === 'history' ? 'Descargar Historial Mensual' : 'Descargar Planilla Mensual' }}
                </h5>
            </div>
        </template>

        <div class="p-1">
            <div class="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2"
                style="border-radius: 6px;">
                <i class="fad fa-info-circle text-primary"></i>
                <span class="text-slate-700">
                    {{ dialogMode === 'history'
                        ? 'Seleccione los parámetros para exportar el histórico de planillas (mayor a 30 días).'
                        : 'Seleccione los parámetros para generar la planilla de control consolidada mensual.' }}
                </span>
            </div>

            <div class="row g-3">
                <!-- Vehículo -->
                <div class="col-12">
                    <label class="form-label required fw-medium text-muted mb-1"
                        for="report_vehicle_uuid">Vehículo</label>
                    <select id="report_vehicle_uuid" v-model="reportForm.vehicle_uuid"
                        class="form-select form-select-sm">
                        <option value="">Seleccione un vehículo...</option>
                        <option v-for="opt in store.catalogs.vehicles" :key="opt.uuid" :value="opt.uuid">
                            {{ opt.vehicle_license_plate }}
                        </option>
                    </select>
                </div>

                <!-- Mes -->
                <div class="col-12 col-sm-6">
                    <label class="form-label required fw-medium text-muted mb-1" for="report_month">Mes</label>
                    <select id="report_month" v-model="reportForm.month" class="form-select form-select-sm">
                        <option v-for="m in monthsList" :key="m.value" :value="m.value">
                            {{ m.label }}
                        </option>
                    </select>
                </div>

                <!-- Año -->
                <div class="col-12 col-sm-6">
                    <label class="form-label required fw-medium text-muted mb-1" for="report_year">Año</label>
                    <select id="report_year" v-model="reportForm.year" class="form-select form-select-sm">
                        <option v-for="y in yearsList" :key="y" :value="y">
                            {{ y }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-falcon-default btn-sm" @click="showReportDialog = false">
                    Cancelar
                </button>
                <button type="button"
                    :class="['btn btn-sm text-white', dialogMode === 'history' ? 'btn-warning' : 'btn-success']"
                    :disabled="downloadingMonthly || !reportForm.vehicle_uuid" @click="downloadMonthly">
                    <span v-if="downloadingMonthly" class="spinner-border spinner-border-sm me-1"
                        style="width: 14px; height: 14px;"></span>
                    <i v-else class="fad fa-download me-1"></i>
                    Descargar PDF
                </button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at YYYY-MM-DD
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { toast } from '@/utils/toast.js';
import Swal from 'sweetalert2';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

const router = useRouter();
const store = useServiceDeliveryControlSheetStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

const isViewLoading = ref(true);
const searchQuery = ref('');
const projectFilter = ref('');

// Estados para diálogos y cargas de PDF
const showReportDialog = ref(false);
const dialogMode = ref('monthly'); // 'monthly' o 'history'
const downloadingDaily = ref(null);
const downloadingMonthly = ref(false);
const sharingLink = ref(null);

// Solo administradores (SUPERADMIN o ADMIN_EMPRESA) pueden compartir el enlace de firma
const canShareCoordinatorLink = computed(() => (permissionsStore.roles || []).some((r) => {
    const name = typeof r === 'string' ? r : (r?.name ?? '');
    return name === 'SUPERADMIN' || name === 'ADMIN_EMPRESA';
}));

const reportForm = reactive({
    vehicle_uuid: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
});

const monthsList = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
];

const yearsList = computed(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
});

// Permisos cacheados para evitar llamadas excesivas en el render
const permissions = reactive({
    view: false,
    edit: false,
    delete: false,
});

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onProjectFilterChange = async () => { await store.setProjectFilter(projectFilter.value); };

const recorridosCount = (data) => {
    if (Array.isArray(data.routes)) return data.routes.length;
    if (data.routes_total) return Number(data.routes_total);
    return data.daily_route ? 1 : 0;
};

const recorridosTexto = (data) => {
    if (Array.isArray(data.routes) && data.routes.length) {
        return data.routes.map(r => `${r.origin || ''} - ${r.destination || ''}`.trim().replace(/^- | -$/g, '')).filter(Boolean).join(' · ');
    }
    return data.daily_route || '-';
};

const tipoLabel = (t) => ({
    DIRECTO_CON_LA_EMPRESA: 'Directo',
    SUBCONTRATADO: 'Subcontratado',
    CON_VEHICULO_CONTRATADO: 'Veh. contratado',
    EXTERNO_PLATAFORMA: 'Externo',
}[t] || t || '-');
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

const goToCreate = () => router.push('/planilla-de-control-de-prestacion-servicios/crear');
const goToEdit = (uuid) => router.push(`/planilla-de-control-de-prestacion-servicios/editar/${uuid}`);
const goToDetail = (uuid) => router.push(`/planilla-de-control-de-prestacion-servicios/editar/${uuid}`);
const goToInternalControl = () => router.push('/planilla-de-control-de-prestacion-servicios/control-de-servicios');
const goToControl = (uuid) => router.push({ path: '/planilla-de-control-de-prestacion-servicios/control-de-servicios', query: { service_uuid: uuid } });

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar registro?',
    nameField: 'daily_route',
});

const openMonthlyDialog = () => {
    dialogMode.value = 'monthly';
    showReportDialog.value = true;
};

const openHistoryDialog = () => {
    dialogMode.value = 'history';
    showReportDialog.value = true;
};

const downloadDaily = async (uuid) => {
    try {
        downloadingDaily.value = uuid;
        await store.downloadDailyPdf(uuid);
    } catch (err) {
        console.error('Error al descargar PDF diario:', err);
    } finally {
        downloadingDaily.value = null;
    }
};

const downloadMonthly = async () => {
    if (!reportForm.vehicle_uuid) return;
    try {
        downloadingMonthly.value = true;
        await store.downloadMonthlyPdf({
            vehicle_uuid: reportForm.vehicle_uuid,
            month: reportForm.month,
            year: reportForm.year
        });
        showReportDialog.value = false;
    } catch (err) {
        console.error('Error al descargar PDF mensual:', err);
    } finally {
        downloadingMonthly.value = false;
    }
};

const shareCoordinatorLink = async (uuid) => {
    try {
        sharingLink.value = uuid;
        Swal.fire({
            title: 'Generando enlace...',
            text: 'Por favor espera mientras generamos el enlace de firma temporal.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const result = await store.generateCoordinatorSignUrl(uuid);
        const publicUrl = result?.url ?? '';
        if (!publicUrl) throw new Error('Sin enlace');

        Swal.close();

        Swal.fire({
            title: '¡Enlace Generado!',
            html: `
                <p>Comparte este enlace con el coordinador de servicios. Tiene una vigencia de <b>1 hora</b> y su firma se plasmará en el campo RECIBO Y FIRMA:</p>
                <div class="mt-2 p-2 bg-light border rounded text-break text-start font-monospace" style="font-size: 12px; max-height: 100px; overflow-y: auto; word-break: break-all;">
                    ${publicUrl}
                </div>
            `,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: '<i class="fad fa-copy"></i> Copiar Enlace',
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa'
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(publicUrl).then(() => {
                    Swal.fire({
                        title: '¡Copiado!',
                        text: 'El enlace de firma ha sido copiado al portapapeles.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }).catch(err => {
                    console.error('Error al copiar:', err);
                    toast('Error', 'No se pudo copiar automáticamente. Por favor selecciónalo y cópialo manualmente.', 'warning');
                });
            }
        });
    } catch (err) {
        console.error('Error al generar enlace de firma:', err);
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: err.response?.data?.message ?? 'No se pudo generar el enlace de firma del coordinador.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    } finally {
        sharingLink.value = null;
    }
};

const formatRango = (fecha) => {
    if (!fecha) return '';
    const parts = String(fecha).split('-');
    if (parts.length !== 3) return fecha;
    const [y, m, d] = parts.map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

const isServicioCerrado = (data) => !(data?.is_active == 1 || data?.is_active === true);

const estadoDe = (data) => data.control_status || (data.is_active ? 'ABIERTA' : 'CERRADA');

const estadoLabel = (data) => {
    const estado = estadoDe(data);
    if (estado === 'PARCIAL') return 'Parcial';
    return estado === 'ABIERTA' ? 'Abierto' : 'Cerrado';
};

const estadoIcono = (data) => {
    const estado = estadoDe(data);
    if (estado === 'PARCIAL') return 'fad fa-adjust me-1';
    return estado === 'ABIERTA' ? 'fad fa-check-circle me-1' : 'fad fa-circle me-1';
};

const estadoBadge = (data) => {
    const estado = estadoDe(data);
    if (estado === 'PARCIAL') return 'badge-subtle-warning';
    return estado === 'ABIERTA' ? 'badge-subtle-success' : 'badge-subtle-secondary';
};

onMounted(async () => {
    // Calcular permisos una sola vez
    permissions.view = permissionsStore.can('service_delivery_control_sheets.view');
    permissions.edit = permissionsStore.can('service_delivery_control_sheets.edit') && !permissionsStore.hasRole('CONDUCTOR');
    permissions.delete = permissionsStore.can('service_delivery_control_sheets.delete') && !permissionsStore.hasRole('CONDUCTOR');

    try {
        searchQuery.value = store.search;
        projectFilter.value = store.projectFilter || '';
        const companyUuid = userStore.company_uuid;

        const tasks = [store.fetchItems()];
        if (!store.catalogs || Object.keys(store.catalogs).length === 0) {
            tasks.push(store.loadCatalogs(companyUuid));
        } else if (!store.projects?.length && companyUuid) {
            tasks.push(store.loadProjects(companyUuid));
        }
        await Promise.all(tasks);
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
});

onUnmounted(() => destroyTooltips());
</script>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 15px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

/* Tabla Estilo Profesional Falcon */
:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: 0.625rem 0.75rem !important;
    font-size: 0.75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #495057;
    border-bottom: 2px solid #e9ecef !important;
    background: #f8f9fa;
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: 0.625rem 0.75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.825rem !important;
    color: #212529;
    transition: background-color 150ms ease-in-out;
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: #f8f9fa !important;
}

:deep(.professional-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Paginador */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: #f8f9fa !important;
    border-top: 1px solid #e9ecef !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
}

:deep(.p-paginator .p-paginator-page) {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.25rem !important;
    margin: 0 0.125rem;
    font-size: 0.75rem;
    transition: all 150ms ease-in-out;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
    background: #0d6efd !important;
    border-color: #0d6efd !important;
    color: #fff !important;
}

:deep(.p-paginator .p-paginator-page:not(.p-highlight):hover) {
    background: #e9ecef !important;
}

:deep(.p-paginator .p-paginator-current) {
    font-size: 0.75rem;
    color: #6c757d;
}

:deep(.p-paginator .p-dropdown) {
    min-height: auto !important;
    height: 26px !important;
    font-size: 0.75rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    font-size: 0.725rem !important;
    padding: 0 0.25rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    width: 18px !important;
}

/* Badges */
.badge-subtle {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.35em 0.6em;
    transition: all 150ms ease-in-out;
    white-space: nowrap;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
}

.badge-subtle-info {
    background: rgba(13, 202, 240, 0.1);
    color: #0dcaf0;
    border: 1px solid rgba(13, 202, 240, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge-subtle:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botones Acciones */
:deep(.btn-group .btn) {
    padding: 0.25rem 0.45rem;
    transition: all 150ms ease-in-out;
}

:deep(.btn-group .btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    z-index: 1;
}
</style>
