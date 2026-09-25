import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{$ as t,A as n,B as r,D as i,E as a,Q as o,R as s,T as ee,V as c,Z as te,_ as ne,at as l,c as u,ct as d,it as f,j as p,l as re,nt as m,st as h,w as g,x as _,z as ie}from"./vendor-vue-YDiet9Ok.js";import{t as ae}from"./permissions-RAYTM2mk.js";import{t as v}from"./vendor-feedback-p_XCIix1.js";import{p as y}from"./index-D1Yf21yt.js";import{t as b}from"./BasePageHeader-DhfwDZkJ.js";import{n as x,t as S}from"./useTableActions-vZuLpQVA.js";import{t as C}from"./NoaTableSpinner-DYHnbk4E.js";import{n as w,t as T}from"./column-B7x0_5aE.js";import{t as E}from"./vehicles.store-yZGleVTN.js";var D=e(v()),O={class:`card border-0 shadow-sm mb-3 fade-in-up`,style:{"animation-delay":`0.1s`}},k={class:`card-body position-relative py-2`},A={class:`d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3`},j={class:`d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3`},M={class:`input-group input-group-sm w-100`,style:{"max-width":`420px`}},N={key:0,class:`text-muted text-lg-end text-nowrap`},P={key:0},F={class:`row gx-3 fade-in-up`,style:{"animation-delay":`0.2s`}},I={class:`col-12 col-xxl-12`},L={class:`card border-0 shadow-sm`},R={key:0,class:`card-body p-0`},z={class:`table-responsive scrollbar`},B={class:`table table-sm mb-0`},V={class:`d-flex justify-content-center gap-1`},H={key:1,class:`card-body p-0`},U={class:`table-responsive scrollbar`},W={class:`d-flex flex-column`},G={class:`text-dark fw-semibold`},K={key:0,class:`text-muted`,style:{"font-size":`0.75rem`}},q={class:`text-dark`},oe={class:`text-dark`},se={class:`text-dark`},ce={class:`text-dark`},le={class:`text-dark`},ue={class:`badge rounded-pill badge-subtle badge-subtle-info`},de={class:`btn-group btn-group-sm`,role:`group`},fe=[`aria-label`,`onClick`],pe=[`aria-label`,`onClick`],me=[`aria-label`,`onClick`],he=[`aria-label`,`onClick`],ge=[`aria-label`,`onClick`],J=y({__name:`VehiclesListView`,setup(e){let v=re(),y=u(),J=E(),_e=ae(),Y=m(!0),X=m(``),{debouncedSearch:Z}=x({},()=>J.setGlobalFilter(X.value)),{confirmDelete:ve,initTooltips:ye,destroyTooltips:be}=S(J,v),Q=e=>_e.can(e),$=async()=>{X.value=``,await J.clearFilters()},xe=()=>J.fetchItems(),Se=async({first:e,rows:t})=>{J.pagination.itemsPerPage=t,await J.setPage(Math.floor(e/t)+1)},Ce=()=>v.push(`/vehiculos/crear`),we=e=>v.push(`/vehiculos/editar/${e}`),Te=e=>v.push(`/vehiculos/perfil/${e}`),Ee=e=>v.push({path:`/mantenimiento/proyeccion`,query:{vehicle:e}}),De=e=>ve(e,{title:`¿Eliminar vehículo?`,nameField:`vehicle_license_plate`}),Oe=async e=>{try{(!J.catalogs.branches||J.catalogs.branches.length===0)&&await J.loadCatalogs();let t=J.catalogs.branches||[];if(t.length===0){await D.default.fire({title:`Atención`,text:`No hay sedes configuradas en el sistema.`,icon:`warning`,confirmButtonText:`Aceptar`});return}let n=e.branch?.uuid||``,r=t.filter(e=>e.uuid!==n);if(r.length===0){await D.default.fire({title:`Información`,text:`No hay otras sedes configuradas en el sistema a las que se pueda trasladar este vehículo.`,icon:`info`,confirmButtonText:`Aceptar`});return}let i=``,a=`
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
            `,showCancelButton:!0,confirmButtonText:`Guardar Cambios`,cancelButtonText:`Cancelar`,confirmButtonColor:`#0d6efd`,cancelButtonColor:`#6c757d`,customClass:{popup:`rounded-3 shadow-lg border-0`,confirmButton:`btn btn-primary px-3 py-2 fw-medium btn-sm`,cancelButton:`btn btn-secondary px-3 py-2 fw-medium btn-sm`},didOpen:e=>{let t=e.querySelector(`.swal2-confirm`);t&&(t.disabled=!0);let n=e.querySelectorAll(`.branch-card-item`);n.forEach(e=>{e.addEventListener(`click`,()=>{n.forEach(e=>{e.classList.remove(`selected`)}),e.classList.add(`selected`),i=e.getAttribute(`data-uuid`),t&&(t.disabled=!1)})})}});o&&i&&i!==n&&(await J.updateItem(e.uuid,{branch_uuid:i}),await J.fetchItems())}catch(e){console.error(`Error al cambiar la sede:`,e)}};return te(()=>[J.search,J.pagination.currentPage,J.pagination.itemsPerPage],([e,t,n])=>{v.replace({query:{...y.query,search:e||void 0,page:t>1?t:void 0,per_page:n===10?void 0:n}})}),s(async()=>{try{let e=y.query.page?parseInt(y.query.page,10):1,t=y.query.per_page?parseInt(y.query.per_page,10):10,n=y.query.search||``;J.search=n,J.pagination.currentPage=e,J.pagination.itemsPerPage=t,X.value=n,await J.fetchItems()}finally{Y.value=!1,ye()}}),ie(()=>be()),(e,s)=>(r(),i(_,null,[p(b,{title:`Listado de Vehicles`,description:`Gestión del módulo en el sistema.`,icon:`fad fa-clipboard-list text-primary`,"show-refresh":!0,"show-create":Q(`vehicles.create`),"show-bg":!0,loading:Y.value||f(J).loading,compact:!0,breadcrumbs:[{label:`Vehicles`},{label:`Listado`}],onRefresh:xe,onCreate:Ce},null,8,[`show-create`,`loading`]),g(`div`,O,[s[6]||=g(`div`,{class:`bg-holder d-none d-lg-block bg-card`,style:{"background-image":`url(/assets/img/icons/spot-illustrations/corner-4.png)`}},null,-1),g(`div`,k,[g(`div`,A,[g(`div`,j,[s[4]||=g(`h6`,{class:`mb-0 fw-medium text-nowrap`},`Búsqueda`,-1),g(`div`,M,[s[3]||=g(`span`,{class:`input-group-text bg-light border-end-0`},[g(`i`,{class:`fad fa-search text-muted`})],-1),t(g(`input`,{"onUpdate:modelValue":s[0]||=e=>X.value=e,class:`form-control form-control-sm border-start-0 shadow-none`,type:`search`,placeholder:`Buscar...`,"aria-label":`Buscar vehículo`,onInput:s[1]||=(...e)=>f(Z)&&f(Z)(...e)},null,544),[[ne,X.value]]),X.value?(r(),i(`button`,{key:0,class:`btn btn-outline-secondary border-start-0`,type:`button`,title:`Limpiar`,onClick:$},[...s[2]||=[g(`i`,{class:`fad fa-times`},null,-1)]])):a(``,!0)])]),!Y.value&&!f(J).loading?(r(),i(`div`,N,[g(`small`,null,[s[5]||=g(`i`,{class:`fad fa-filter me-1`},null,-1),n(` `+d(f(J).pagination.totalItems)+` resultado`+d(f(J).pagination.totalItems===1?``:`s`)+` `,1),f(J).search?(r(),i(`span`,P,` para "`+d(f(J).search)+`"`,1)):a(``,!0)])])):a(``,!0)])])]),g(`div`,F,[g(`div`,I,[g(`div`,L,[s[13]||=g(`div`,{class:`bg-holder d-none d-lg-block bg-card`,style:{"background-image":`url(/assets/img/icons/spot-illustrations/corner-4.png)`}},null,-1),Y.value?(r(),i(`div`,R,[g(`div`,z,[g(`table`,B,[g(`thead`,null,[g(`tr`,null,[(r(),i(_,null,c([`30%`,`20%`,`20%`,`15%`,`15%`],e=>g(`th`,{key:e,style:{padding:`12px 8px`}},[g(`div`,{class:`skeleton-text`,style:h(`height:16px;width:${e}`)},null,4)])),64))])]),g(`tbody`,null,[(r(!0),i(_,null,c(f(J).pagination.itemsPerPage,e=>(r(),i(`tr`,{key:`sk-${e}`},[(r(),i(_,null,c(4,e=>g(`td`,{key:e},[...s[7]||=[g(`div`,{class:`skeleton-text`,style:{height:`18px`,width:`75%`}},null,-1)]])),64)),g(`td`,null,[g(`div`,V,[(r(),i(_,null,c(3,e=>g(`div`,{key:e,class:`skeleton-icon`,style:{height:`28px`,width:`28px`}})),64))])])]))),128))])])])])):(r(),i(`div`,H,[g(`div`,U,[p(f(w),{value:f(J).items,lazy:``,paginator:!0,rows:f(J).pagination.itemsPerPage,totalRecords:f(J).pagination.totalItems,first:(f(J).pagination.currentPage-1)*f(J).pagination.itemsPerPage,loading:f(J).loading,rowsPerPageOptions:[10,25,50,100],responsiveLayout:`scroll`,tableStyle:`min-width: 50rem`,class:`table table-sm mb-0 professional-table`,paginatorTemplate:`FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown`,currentPageReportTemplate:`Mostrando {first} a {last} de {totalRecords} registros`,emptyMessage:`No se encontraron registros`,onPage:Se},{loading:o(()=>[p(C,{message:`Cargando datos...`})]),default:o(()=>[p(f(T),{field:`vehicle_license_plate`,header:`Placa / Afiliado`,sortable:``},{body:o(({data:e})=>[g(`div`,W,[g(`span`,G,d(e.vehicle_license_plate||`-`),1),e.third_party?(r(),i(`small`,K,d(e.third_party.company_name||`${e.third_party.first_name}
                                            ${e.third_party.last_name}`),1)):a(``,!0)])]),_:1}),p(f(T),{field:`vehicle_class.description`,header:`Clase`,sortable:``},{body:o(({data:e})=>[g(`span`,q,d(e.vehicle_class?.description||`-`),1)]),_:1}),p(f(T),{field:`brand.description`,header:`Marca`,sortable:``},{body:o(({data:e})=>[g(`span`,oe,d(e.brand?.description||`-`),1)]),_:1}),p(f(T),{field:`line`,header:`Línea`,sortable:``},{body:o(({data:e})=>[g(`span`,se,d(e.line||`-`),1)]),_:1}),p(f(T),{field:`model`,header:`Modelo`,sortable:``},{body:o(({data:e})=>[g(`span`,ce,d(e.model||`-`),1)]),_:1}),p(f(T),{field:`branch.name`,header:`Sucursal`,sortable:``},{body:o(({data:e})=>[g(`span`,le,d(e.branch?.name||`-`),1)]),_:1}),p(f(T),{field:`type_of_service`,header:`Servicio`,sortable:``},{body:o(({data:e})=>[g(`span`,ue,d(e.type_of_service===`PUBLICO`?`Público`:`Particular`),1)]),_:1}),p(f(T),{field:`is_active`,header:`Estado`,sortable:``,class:`text-center`,style:{width:`100px`}},{body:o(({data:e})=>[g(`span`,{class:l([`badge rounded-pill badge-subtle`,e.is_active?`badge-subtle-success`:`badge-subtle-warning`])},[g(`i`,{class:l(e.is_active?`fad fa-check-circle me-1`:`fad fa-circle me-1`),style:{"font-size":`10px`}},null,2),n(` `+d(e.is_active?`Activo`:`Inactivo`),1)],2)]),_:1}),Q(`vehicles.profile`)||Q(`vehicles.update`)||Q(`vehicles.change_branch`)||Q(`vehicles.delete`)?(r(),ee(f(T),{key:0,header:`Acciones`,class:`text-center`,style:{"min-width":`150px`,width:`150px`}},{body:o(({data:e})=>[g(`div`,de,[Q(`vehicles.profile`)?(r(),i(`button`,{key:0,class:`btn btn-falcon-default`,type:`button`,title:`Ver detalle`,"aria-label":`Ver detalle de ${e.vehicle_license_plate}`,onClick:t=>Te(e.uuid)},[...s[8]||=[g(`i`,{class:`fad fa-eye text-primary`,style:{"font-size":`14px`}},null,-1)]],8,fe)):a(``,!0),Q(`vehicles.update`)?(r(),i(`button`,{key:1,class:`btn btn-falcon-default`,type:`button`,title:`Editar`,"aria-label":`Editar ${e.vehicle_license_plate}`,onClick:t=>we(e.uuid)},[...s[9]||=[g(`i`,{class:`fad fa-edit text-warning`,style:{"font-size":`14px`}},null,-1)]],8,pe)):a(``,!0),Q(`vehicles.change_branch`)?(r(),i(`button`,{key:2,class:`btn btn-falcon-default`,type:`button`,title:`Cambiar Sede`,"aria-label":`Cambiar sede de ${e.vehicle_license_plate}`,onClick:t=>Oe(e)},[...s[10]||=[g(`i`,{class:`fad fa-building text-info`,style:{"font-size":`14px`}},null,-1)]],8,me)):a(``,!0),Q(`maintenance.forecast`)?(r(),i(`button`,{key:3,class:`btn btn-falcon-default`,type:`button`,title:`Proyección de Mantenimiento`,"aria-label":`Proyección de mantenimiento de ${e.vehicle_license_plate}`,onClick:t=>Ee(e.uuid)},[...s[11]||=[g(`i`,{class:`fad fa-calendar-check text-success`,style:{"font-size":`14px`}},null,-1)]],8,he)):a(``,!0),Q(`vehicles.delete`)?(r(),i(`button`,{key:4,class:`btn btn-falcon-default`,type:`button`,title:`Eliminar`,"aria-label":`Eliminar ${e.vehicle_license_plate}`,onClick:t=>De(e)},[...s[12]||=[g(`i`,{class:`fad fa-trash text-danger`,style:{"font-size":`14px`}},null,-1)]],8,ge)):a(``,!0)])]),_:1})):a(``,!0)]),_:1},8,[`value`,`rows`,`totalRecords`,`first`,`loading`])])]))])])])],64))}},[[`__scopeId`,`data-v-b04e070f`]]);export{J as default};