import{A as e,B as t,D as n,L as r,R as i,Z as a,w as o}from"./vendor-vue-YDiet9Ok.js";import{t as s}from"./tracking.store-BekgbPCe.js";import{t as c}from"./useGeolocation-DlwqsVwZ.js";var l={class:`relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200`},u=12,d={__name:`DriverMap`,props:{showGeofences:{type:Boolean,default:!0},interactive:{type:Boolean,default:!0}},emits:[`driver-selected`],setup(d,{emit:f}){let p=d,m=f,h=s(),{loadLeaflet:g}=c(),_=null,v={},y=[],b=null,x=[4.710993,-74.072068],S=(e,t=`?`)=>`
    <div style="
        width:38px;height:38px;min-width:38px;
        border-radius:50%;
        background:${e?`#22c55e`:`#f59e0b`};
        border:3px solid white;
        box-shadow:0 2px 10px rgba(0,0,0,.25);
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:12px;font-weight:700;letter-spacing:.5px;
        box-sizing:border-box;
    ">${t}</div>
`;function C(e){_=e.map(`trackingMap`,{center:x,zoom:u,zoomControl:!0}),e.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,{attribution:`© OpenStreetMap contributors`,maxZoom:19}).addTo(_),h.selectedDriver?.history&&A(e,h.selectedDriver.history),p.showGeofences&&T()}function w(){_&&(y.forEach(e=>_.removeLayer(e)),y=[])}function T(){!_||!window.L||(w(),h.geofences.filter(e=>e.is_active!==!1).forEach(e=>k(window.L,e)))}a(()=>p.showGeofences,e=>{_&&(e?T():w())}),a(()=>h.activeDrivers,()=>{N()});function E(e){let t=e.driver?.first_name||e.first_name||``,n=e.driver?.last_name||e.last_name||``;return t&&n?(t[0]+n[0]).toUpperCase():(t[0]||`?`).toUpperCase()}function D(e,t){if(!t?.latitude&&!t?.last_location?.latitude)return;let n=t.latitude??t.last_location?.latitude,r=t.longitude??t.last_location?.longitude,i=t.is_moving??t.last_location?.is_moving??!1,a=E(t);if(v[t.third_party_uuid]){v[t.third_party_uuid].setLatLng([n,r]),v[t.third_party_uuid].setIcon(e.divIcon({html:S(i,a),className:``})),v[t.third_party_uuid].bindPopup(O(t));return}let o=e.marker([n,r],{icon:e.divIcon({html:S(i,a),className:``})}).addTo(_);o.bindPopup(O(t)),o.on(`click`,()=>{h.selectDriver(t),m(`driver-selected`,t)}),v[t.third_party_uuid]=o}function O(e){let t=`${e.driver?.first_name||e.first_name||`Conductor`} ${e.driver?.last_name||e.last_name||``}`.trim(),n=e.vehicle?.vehicle_license_plate||e.vehicle_license_plate||`Sin vehículo`,r=e.driver?.document_number||e.document_number||``,i=Math.round(e.speed??e.last_location?.speed??0),a=e.is_moving??e.last_location?.is_moving??!1,o=e.project?.project_name||e.planilla_dia?.project_name||null,s=e.planilla_dia?.routes||[],c=s.find(e=>e.funcionario_nombre||e.funcionario_cc),l=c?.funcionario_nombre||null,u=c?.funcionario_cc||null,d=e.planilla_dia?.es_planilla_hoy!==!1,f=e.planilla_dia?.service_date?new Date(e.planilla_dia.service_date).toLocaleDateString(`es-CO`,{day:`2-digit`,month:`2-digit`}):``,p=a?`#16a34a`:`#b45309`,m=a?`#f0fdf4`:`#fffbeb`,h=a?`#bbf7d0`:`#fde68a`,g=s.length?s.slice(0,3).map(e=>`<div style="display:flex;align-items:center;gap:4px;padding:2px 0;">
                <span style="color:#94a3b8;font-size:10px;">▸</span>
                <span style="color:#1e293b;">${e.origin||`?`} → ${e.destination||`?`}</span>
            </div>`).join(``)+(s.length>3?`<div style="color:#94a3b8;font-size:10px;padding-top:2px;">+${s.length-3} rutas más</div>`:``):`<span style="color:#94a3b8;">Sin rutas registradas</span>`,_=s.length?d?`Rutas de hoy`:`Rutas del ${f}`:`Rutas`,v=`display:flex;align-items:center;gap:6px;padding:3px 0;`,y=`color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;min-width:64px;`,b=`border:none;border-top:1px dashed #e2e8f0;margin:6px 0;`;return`
        <div style="min-width:240px;max-width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:4px 2px;">

            <!-- Encabezado: nombre + velocidad -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                <div>
                    <div style="font-weight:700;font-size:13px;color:#0f172a;line-height:1.2;">${t}</div>
                    <div style="font-size:11px;color:#64748b;margin-top:1px;">🚗 ${n}${r?` · CC ${r}`:``}</div>
                </div>
                <div style="
                    background:${m};color:${p};
                    border:1px solid ${h};
                    border-radius:20px;padding:3px 9px;
                    font-size:12px;font-weight:700;white-space:nowrap;
                    flex-shrink:0;
                ">${i} km/h</div>
            </div>

            <hr style="${b}">

            <!-- Proyecto -->
            ${o?`
            <div style="${v}">
                <span style="${y}">Proyecto</span>
                <span style="
                    background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;
                    border-radius:20px;padding:1px 8px;
                    font-size:10px;font-weight:600;
                    max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
                ">${o}</span>
            </div>`:``}

            <!-- Funcionario -->
            ${l?`
            <div style="${v}">
                <span style="${y}">Funcionario</span>
                <span style="color:#1e293b;font-size:11px;">${l}${u?` <span style='color:#94a3b8'>· CC ${u}</span>`:``}${s.length>1?` <span style='color:#94a3b8'>(+${s.length-1})</span>`:``}</span>
            </div>`:``}

            <hr style="${b}">

            <!-- Rutas -->
            <div style="margin-bottom:2px;">
                <div style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">${_}</div>
                <div style="font-size:11px;">${g}</div>
            </div>
        </div>
    `}function k(e,t){let n=null;if(t.type===`circle`)n=e.circle([t.center_lat,t.center_lng],{radius:t.radius_meters,color:`#ef4444`,fillColor:`#ef4444`,fillOpacity:.15,weight:2}).addTo(_),n.bindPopup(`<strong>${t.name}</strong><br>Zona circular · ${t.radius_meters} m`);else if(t.type===`polygon`){let r=(t.polygon_points||[]).map(e=>[e.lat??e[0],e.lng??e[1]]);n=e.polygon(r,{color:`#ef4444`,fillColor:`#ef4444`,fillOpacity:.15,weight:2}).addTo(_),n.bindPopup(`<strong>${t.name}</strong><br>Zona poligonal`)}n&&y.push(n)}function A(e,t){if(b&&_.removeLayer(b),!t||t.length<2)return;let n=t.map(e=>[e.latitude,e.longitude]);b=e.polyline(n,{color:`#3b82f6`,weight:4,opacity:.7}).addTo(_);let r=n[0],i=n[n.length-1];e.marker(r,{icon:e.divIcon({html:`🟢`,className:``,iconSize:[20,20]})}).addTo(_),e.marker(i,{icon:e.divIcon({html:`🔴`,className:``,iconSize:[20,20]})}).addTo(_),_.fitBounds(e.latLngBounds(n).pad(.1))}let j=!1;function M(){if(!_||!window.L)return;let e=h.activeDrivers.map(e=>[e.latitude??e.last_location?.latitude,e.longitude??e.last_location?.longitude]).filter(([e,t])=>e!=null&&t!=null);e.length&&(e.length===1?_.setView(e[0],15):_.fitBounds(window.L.latLngBounds(e).pad(.15)),j=!0)}function N(){if(!_)return;let e=window.L;e&&(h.activeDrivers.forEach(t=>D(e,t)),h.activeDrivers.length&&!j&&M(),h.selectedDriver?.history&&A(e,h.selectedDriver.history))}let P=null;return i(async()=>{try{C(await g()),N(),P=setInterval(N,1e4),setTimeout(()=>{_&&_.invalidateSize()},300)}catch(e){console.error(`Error inicializando mapa:`,e)}}),r(()=>{P&&clearInterval(P),_&&=(_.remove(),null)}),(r,i)=>(t(),n(`div`,l,[...i[0]||=[o(`div`,{id:`trackingMap`,class:`w-full h-full`,style:{"min-height":`400px`}},null,-1),o(`div`,{class:`absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow px-3 py-2 text-sm`},[o(`span`,{class:`inline-block w-3 h-3 rounded-full bg-green-500 mr-1`}),e(` En movimiento `),o(`span`,{class:`inline-block w-3 h-3 rounded-full bg-amber-500 mr-1 ml-3`}),e(` Detenido `)],-1)]]))}};export{d as t};