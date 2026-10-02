export const radicacionTORoutes = [
  {
    path: '/radicacion',
    name: 'radicacion.list',
    component: () => import('./views/RadicacionListView.vue'),
    meta: { title: 'Radicación TO', auth: true, layout: 'dashboard', permissions: ['radicacion_to.index'] },
  },
  {
    path: '/radicacion/:uuid',
    name: 'radicacion.wizard',
    component: () => import('./views/RadicacionWizardView.vue'),
    meta: { title: 'Expediente TO', auth: true, layout: 'dashboard', permissions: ['radicacion_to.index'] },
  },
  {
    path: '/firmar-contrato/:token',
    name: 'radicacion.firmar',
    component: () => import('./views/FirmaContratoPublicView.vue'),
    meta: { title: 'Firma de contrato', public: true, layout: 'auth' },
  },
];
