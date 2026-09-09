import{a as e}from"./rolldown-runtime-Cyuzqnbw.js";import{C as t,D as n,G as r,I as i,K as a,L as o,M as ee,N as s,P as c,Y as l,bt as te,ft as u,i as ne,it as d,j as f,nt as re,q as p,r as m,rt as h,vt as g,xt as _,yt as v}from"./vendor-primevue-DzTorM1T.js";import{c as ie,l as ae}from"./vendor-vue-RgvDny5F.js";import{t as y}from"./user-C62zuRtQ.js";import{t as oe}from"./permissions-YL1P_I1T.js";import{n as se}from"./auth.store-6-j6E9MY.js";import{i as b}from"./vendor-ui-BhT4Cv-C.js";import{o as x}from"./index-DV7ZKHVT.js";import{t as S}from"./BasePageHeader-BKZuD9FH.js";import"./vehicles.service-CxUDxrQz.js";import{n as C,t as w}from"./useTableActions-CTN3c7Gp.js";import{t as T}from"./NoaTableSpinner-C-peCkGV.js";import{t as E}from"./vehicles.store-GfzLPok4.js";var D=e(b()),O={class:`card border-0 shadow-sm mb-3 fade-in-up`,style:{"animation-delay":`0.1s`}},k={class:`card-body position-relative py-2`},A={class:`d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3`},j={class:`d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3`},M={class:`input-group input-group-sm w-100`,style:{"max-width":`420px`}},N={key:0,class:`text-muted text-lg-end text-nowrap`},P={key:0},F={class:`row gx-3 fade-in-up`,style:{"animation-delay":`0.2s`}},I={class:`col-12 col-xxl-12`},L={class:`card border-0 shadow-sm`},R={key:0,class:`card-body p-0`},z={class:`table-responsive scrollbar`},B={class:`table table-sm mb-0`},V={class:`d-flex justify-content-center gap-1`},H={key:1,class:`card-body p-0`},U={class:`table-responsive scrollbar`},W={class:`d-flex flex-column`},G={class:`text-dark fw-semibold`},K={key:0,class:`text-muted`,style:{"font-size":`0.75rem`}},ce={class:`text-dark`},le={class:`text-dark`},ue={class:`text-dark`},de={class:`text-dark`},fe={class:`text-dark`},pe={class:`badge rounded-pill badge-subtle badge-subtle-info`},me={class:`btn-group btn-group-sm`,role:`group`},he=[`onClick`],ge=[`onClick`],_e=[`onClick`],ve=[`onClick`],ye=[`onClick`],q=x({__name:`VehiclesListView`,setup(e){let b=ae(),x=ie(),q=E(),J=se(),be=y(),Y=oe(),X=u(!0),Z=u(``);u(null);let{debouncedSearch:Q}=C({},()=>q.setGlobalFilter(Z.value)),{confirmDelete:xe,initTooltips:Se,destroyTooltips:Ce}=w(q,b),$=e=>Y.can(e),we=async()=>{Z.value=``,await q.clearFilters()},Te=()=>q.fetchItems(),Ee=async({first:e,rows:t})=>{q.pagination.itemsPerPage=t,await q.setPage(Math.floor(e/t)+1)},De=()=>b.push(`/vehiculos/crear`),Oe=e=>b.push(`/vehiculos/editar/${e}`),ke=e=>b.push(`/vehiculos/perfil/${e}`),Ae=e=>b.push({path:`/mantenimiento/proyeccion`,query:{vehicle:e}}),je=e=>xe(e,{title:`¿Eliminar vehículo?`,nameField:`vehicle_license_plate`}),Me=async e=>{try{(!q.catalogs.branches||q.catalogs.branches.length===0)&&await q.loadCatalogs();let t=q.catalogs.branches||[];if(t.length===0){await D.default.fire({title:`Atención`,text:`No hay sedes configuradas en el sistema.`,icon:`warning`,confirmButtonText:`Aceptar`});return}let n=e.branch?.uuid||``,r=t.filter(e=>e.uuid!==n);if(r.length===0){await D.default.fire({title:`Información`,text:`No hay otras sedes configuradas en el sistema a las que se pueda trasladar este vehículo.`,icon:`info`,confirmButtonText:`Aceptar`});return}let i=``,a=`
            <style>
                .branch-card-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    margin-bottom: 8px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    background: #fff;
                    cursor: pointer;
                    transition: all 150ms ease-in-out;
                    text-align: left;
                }
                .branch-card-item:hover {
                    border-color: #0d6efd;
                    background-color: #f8f9fa;
                }
                .branch-card-item.selected {
                    border-color: #0d6efd !important;
                    background-color: #f0f5ff !important;
                }
                .branch-card-item.selected .branch-icon-box {
                    background: #0d6efd !important;
                    color: #fff !important;
                }
                .branch-card-item.selected .select-check-indicator {
                    border-color: #0d6efd !important;
                    background-color: #0d6efd !important;
                    color: #fff !important;
                }
                .branch-card-item .select-check-indicator i,
                .branch-card-item .select-check-indicator svg {
                    display: none !important;
                }
                .branch-card-item.selected .select-check-indicator i,
                .branch-card-item.selected .select-check-indicator svg {
                    display: block !important;
                }
            </style>
            <div class="branch-selector-container" style="max-height: 320px; overflow-y: auto; padding: 4px;">
        `;r.forEach(e=>{a+=`
                <div class="branch-card-item" data-uuid="${e.uuid}">
                    <div class="branch-icon-box" style="
                        width: 36px;
                        height: 36px;
                        border-radius: 6px;
                        background: #f8f9fa;
                        color: #0d6efd;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        transition: all 150ms ease;
                    ">
                        <i class="fad fa-building"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #2d3748; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e.name}</div>
                        <div style="font-size: 0.725rem; color: #718096; margin-top: 1px;">
                            Trasladar vehículo a esta sede
                        </div>
                    </div>
                    <div class="select-check-indicator" style="
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        border: 2px solid #cbd5e0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
                        color: #fff;
                        font-size: 9px;
                        transition: all 150ms ease;
                    ">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            `}),a+=`</div>`;let{isConfirmed:o}=await D.default.fire({title:`<span style="font-size: 1.15rem; font-weight: 700; color: #1a202c;">Cambiar Sede del Vehículo</span>`,html:`
                <div style="text-align: left; margin-bottom: 12px; font-size: 0.8rem; color: #4a5568; line-height: 1.4;">
                    Seleccione la nueva sucursal para asociar al vehículo con placa <strong class="text-primary">${e.vehicle_license_plate}</strong>:
                </div>
                ${a}
            `,showCancelButton:!0,confirmButtonText:`Guardar Cambios`,cancelButtonText:`Cancelar`,confirmButtonColor:`#0d6efd`,cancelButtonColor:`#6c757d`,customClass:{popup:`rounded-3 shadow-lg border-0`,confirmButton:`btn btn-primary px-3 py-2 fw-medium btn-sm`,cancelButton:`btn btn-secondary px-3 py-2 fw-medium btn-sm`},didOpen:e=>{let t=e.querySelector(`.swal2-confirm`);t&&(t.disabled=!0);let n=e.querySelectorAll(`.branch-card-item`);n.forEach(e=>{e.addEventListener(`click`,()=>{n.forEach(e=>{e.classList.remove(`selected`)}),e.classList.add(`selected`),i=e.getAttribute(`data-uuid`),t&&(t.disabled=!1)})})}});o&&i&&i!==n&&(await q.updateItem(e.uuid,{branch_uuid:i}),await q.fetchItems())}catch(e){console.error(`Error al cambiar la sede:`,e)}};return re(()=>[q.search,q.pagination.currentPage,q.pagination.itemsPerPage],([e,t,n])=>{b.replace({query:{...x.query,search:e||void 0,page:t>1?t:void 0,per_page:n===10?void 0:n}})}),r(async()=>{try{let e=0;for(;!J.isHydrated&&e<100;)await new Promise(e=>setTimeout(e,20)),e++;if(J.isAuthenticated)for(e=0;(!be.id||!Y.isLoaded)&&e<100;)await new Promise(e=>setTimeout(e,20)),e++;let t=x.query.page?parseInt(x.query.page,10):1,n=x.query.per_page?parseInt(x.query.per_page,10):10,r=x.query.search||``;q.search=r,q.pagination.currentPage=t,q.pagination.itemsPerPage=n,Z.value=r,await q.fetchItems()}finally{setTimeout(()=>{X.value=!1,Se()},300)}}),a(()=>Ce()),(e,r)=>(p(),c(n,null,[o(S,{title:`Listado de Vehicles`,description:`Gestión del módulo en el sistema.`,icon:`fad fa-clipboard-list text-primary`,"show-refresh":!0,"show-create":$(`vehicles.create`),"show-bg":!0,loading:X.value||g(q).loading,compact:!0,breadcrumbs:[{label:`Vehicles`},{label:`Listado`}],onRefresh:Te,onCreate:De},null,8,[`show-create`,`loading`]),f(`div`,O,[r[6]||=f(`div`,{class:`bg-holder d-none d-lg-block bg-card`,style:{"background-image":`url(/assets/img/icons/spot-illustrations/corner-4.png)`}},null,-1),f(`div`,k,[f(`div`,A,[f(`div`,j,[r[4]||=f(`h6`,{class:`mb-0 fw-medium text-nowrap`},`Búsqueda`,-1),f(`div`,M,[r[3]||=f(`span`,{class:`input-group-text bg-light border-end-0`},[f(`i`,{class:`fad fa-search text-muted`})],-1),d(f(`input`,{"onUpdate:modelValue":r[0]||=e=>Z.value=e,class:`form-control form-control-sm border-start-0 shadow-none`,type:`search`,placeholder:`Buscar...`,onInput:r[1]||=(...e)=>g(Q)&&g(Q)(...e)},null,544),[[t,Z.value]]),Z.value?(p(),c(`button`,{key:0,class:`btn btn-outline-secondary border-start-0`,type:`button`,title:`Limpiar`,onClick:we},[...r[2]||=[f(`i`,{class:`fad fa-times`},null,-1)]])):s(``,!0)])]),!X.value&&!g(q).loading?(p(),c(`div`,N,[f(`small`,null,[r[5]||=f(`i`,{class:`fad fa-filter me-1`},null,-1),i(` `+_(g(q).pagination.totalItems)+` resultado`+_(g(q).pagination.totalItems===1?``:`s`)+` `,1),g(q).search?(p(),c(`span`,P,` para "`+_(g(q).search)+`"`,1)):s(``,!0)])])):s(``,!0)])])]),f(`div`,F,[f(`div`,I,[f(`div`,L,[r[13]||=f(`div`,{class:`bg-holder d-none d-lg-block bg-card`,style:{"background-image":`url(/assets/img/icons/spot-illustrations/corner-4.png)`}},null,-1),X.value?(p(),c(`div`,R,[f(`div`,z,[f(`table`,B,[f(`thead`,null,[f(`tr`,null,[(p(),c(n,null,l([`30%`,`20%`,`20%`,`15%`,`15%`],e=>f(`th`,{key:e,style:{padding:`12px 8px`}},[f(`div`,{class:`skeleton-text`,style:te(`height:16px;width:${e}`)},null,4)])),64))])]),f(`tbody`,null,[(p(!0),c(n,null,l(g(q).pagination.itemsPerPage,e=>(p(),c(`tr`,{key:`sk-${e}`},[(p(),c(n,null,l(4,e=>f(`td`,{key:e},[...r[7]||=[f(`div`,{class:`skeleton-text`,style:{height:`18px`,width:`75%`}},null,-1)]])),64)),f(`td`,null,[f(`div`,V,[(p(),c(n,null,l(3,e=>f(`div`,{key:e,class:`skeleton-icon`,style:{height:`28px`,width:`28px`}})),64))])])]))),128))])])])])):(p(),c(`div`,H,[f(`div`,U,[o(g(ne),{value:g(q).items,lazy:``,paginator:!0,rows:g(q).pagination.itemsPerPage,totalRecords:g(q).pagination.totalItems,first:(g(q).pagination.currentPage-1)*g(q).pagination.itemsPerPage,loading:g(q).loading,rowsPerPageOptions:[10,25,50,100],responsiveLayout:`scroll`,tableStyle:`min-width: 50rem`,class:`table table-sm mb-0 professional-table`,paginatorTemplate:`FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown`,currentPageReportTemplate:`Mostrando {first} a {last} de {totalRecords} registros`,emptyMessage:`No se encontraron registros`,onPage:Ee},{loading:h(()=>[o(T,{message:`Cargando datos...`})]),default:h(()=>[o(g(m),{field:`vehicle_license_plate`,header:`Placa / Afiliado`,sortable:``},{body:h(({data:e})=>[f(`div`,W,[f(`span`,G,_(e.vehicle_license_plate||`-`),1),e.third_party?(p(),c(`small`,K,_(e.third_party.company_name||`${e.third_party.first_name}
                                            ${e.third_party.last_name}`),1)):s(``,!0)])]),_:1}),o(g(m),{field:`vehicle_class.description`,header:`Clase`,sortable:``},{body:h(({data:e})=>[f(`span`,ce,_(e.vehicle_class?.description||`-`),1)]),_:1}),o(g(m),{field:`brand.description`,header:`Marca`,sortable:``},{body:h(({data:e})=>[f(`span`,le,_(e.brand?.description||`-`),1)]),_:1}),o(g(m),{field:`line`,header:`Línea`,sortable:``},{body:h(({data:e})=>[f(`span`,ue,_(e.line||`-`),1)]),_:1}),o(g(m),{field:`model`,header:`Modelo`,sortable:``},{body:h(({data:e})=>[f(`span`,de,_(e.model||`-`),1)]),_:1}),o(g(m),{field:`branch.name`,header:`Sucursal`,sortable:``},{body:h(({data:e})=>[f(`span`,fe,_(e.branch?.name||`-`),1)]),_:1}),o(g(m),{field:`type_of_service`,header:`Servicio`,sortable:``},{body:h(({data:e})=>[f(`span`,pe,_(e.type_of_service===`PUBLICO`?`Público`:`Particular`),1)]),_:1}),o(g(m),{field:`is_active`,header:`Estado`,sortable:``,class:`text-center`,style:{width:`100px`}},{body:h(({data:e})=>[f(`span`,{class:v([`badge rounded-pill badge-subtle`,e.is_active?`badge-subtle-success`:`badge-subtle-warning`])},[f(`i`,{class:v(e.is_active?`fad fa-check-circle me-1`:`fad fa-circle me-1`),style:{"font-size":`10px`}},null,2),i(` `+_(e.is_active?`Activo`:`Inactivo`),1)],2)]),_:1}),$(`vehicles.profile`)||$(`vehicles.update`)||$(`vehicles.change_branch`)||$(`vehicles.delete`)?(p(),ee(g(m),{key:0,header:`Acciones`,class:`text-center`,style:{"min-width":`150px`,width:`150px`}},{body:h(({data:e})=>[f(`div`,me,[$(`vehicles.profile`)?(p(),c(`button`,{key:0,class:`btn btn-falcon-default`,type:`button`,title:`Ver detalle`,onClick:t=>ke(e.uuid)},[...r[8]||=[f(`i`,{class:`fad fa-eye text-primary`,style:{"font-size":`14px`}},null,-1)]],8,he)):s(``,!0),$(`vehicles.update`)?(p(),c(`button`,{key:1,class:`btn btn-falcon-default`,type:`button`,title:`Editar`,onClick:t=>Oe(e.uuid)},[...r[9]||=[f(`i`,{class:`fad fa-edit text-warning`,style:{"font-size":`14px`}},null,-1)]],8,ge)):s(``,!0),$(`vehicles.change_branch`)?(p(),c(`button`,{key:2,class:`btn btn-falcon-default`,type:`button`,title:`Cambiar Sede`,onClick:t=>Me(e)},[...r[10]||=[f(`i`,{class:`fad fa-building text-info`,style:{"font-size":`14px`}},null,-1)]],8,_e)):s(``,!0),$(`maintenance.forecast`)?(p(),c(`button`,{key:3,class:`btn btn-falcon-default`,type:`button`,title:`Proyección de Mantenimiento`,onClick:t=>Ae(e.uuid)},[...r[11]||=[f(`i`,{class:`fad fa-calendar-check text-success`,style:{"font-size":`14px`}},null,-1)]],8,ve)):s(``,!0),$(`vehicles.delete`)?(p(),c(`button`,{key:4,class:`btn btn-falcon-default`,type:`button`,title:`Eliminar`,onClick:t=>je(e)},[...r[12]||=[f(`i`,{class:`fad fa-trash text-danger`,style:{"font-size":`14px`}},null,-1)]],8,ye)):s(``,!0)])]),_:1})):s(``,!0)]),_:1},8,[`value`,`rows`,`totalRecords`,`first`,`loading`])])]))])])])],64))}},[[`__scopeId`,`data-v-89eb1591`]]);export{q as default};