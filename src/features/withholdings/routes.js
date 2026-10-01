export const withholdingsRoutes = [
    {
        path: '/configuracion/retenciones',
        name: 'withholdings.list',
        component: () => import('./views/WithholdingsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
        },
    },
    {
        path: '/configuracion/retenciones/crear',
        name: 'withholdings.create',
        component: () => import('./views/WithholdingsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
        },
    },
    {
        path: '/configuracion/retenciones/editar/:id',
        name: 'withholdings.edit',
        component: () => import('./views/WithholdingsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
        },
    },
];
