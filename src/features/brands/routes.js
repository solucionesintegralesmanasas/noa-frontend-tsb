export const brandsRoutes = [
    {
        path: '/configuracion/marcas',
        name: 'brands.list',
        component: () => import('./views/BrandsListView.vue'),
        meta: {
            title: 'Marcas',
            auth: true,
            layout: 'dashboard',
        },
    },
    {
        path: '/configuracion/marcas/crear',
        name: 'brands.create',
        component: () => import('./views/BrandsFormView.vue'),
        meta: {
            title: 'Crear marca',
            auth: true,
            layout: 'dashboard',
        },
    },
    {
        path: '/configuracion/marcas/editar/:id',
        name: 'brands.edit',
        component: () => import('./views/BrandsFormView.vue'),
        meta: {
            title: 'Editar marca',
            auth: true,
            layout: 'dashboard',
        },
    },
];
