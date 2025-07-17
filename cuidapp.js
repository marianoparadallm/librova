(function(){
    const views={
        login:document.getElementById('view-login'),
        create:document.getElementById('view-create'),
        dash:document.getElementById('view-dashboard'),
        turnos:document.getElementById('view-turnos'),

        admin:document.getElementById('view-admin')
    };

    const supabase = window.supabase.createClient(X_SUPABASE_URL, X_SUPABASE_ANON_KEY);
    let current=null;
    let turnosCache={};
    let bitacoraCache=[];

    let pacientesAdminCache=[];

    const spanNombre = document.getElementById('cuidador-display');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    function obtenerNombreCuidador(){
        let nc = localStorage.getItem('cuidadorNombre') || '';
        if(!nc){
            nc = prompt('¿Cuál es tu nombre?') || '';
            nc = nc.trim();
            if(nc) localStorage.setItem('cuidadorNombre', nc);
        }
        return nc;
    }

    let nombreCuidador = obtenerNombreCuidador();

    if(spanNombre) spanNombre.textContent = nombreCuidador ? `Bienvenido ${nombreCuidador}` : '';
    if(nombreCuidador.toLowerCase() === 'root'){
        listarPacientesAdmin();
        show('admin');
    }


    function cerrarSesion(){
        localStorage.removeItem('cuidadorNombre');
        if(spanNombre) spanNombre.textContent='';
        location.reload();
    }

    if(btnCerrarSesion) btnCerrarSesion.addEventListener('click', cerrarSesion);

    async function cargarListaPacientes(){
        const sel=document.getElementById('login-select');
        if(!sel) return;
        sel.innerHTML='<option value="">Seleccione paciente...</option>';
        const { data, error }=await supabase
            .from('cuidapp_accesos')
            .select('codigo_acceso,cuidapp_pacientes(nombre)')
            .order('cuidapp_pacientes(nombre)');
        if(error) return;
        (data||[]).forEach(p=>{
            const opt=document.createElement('option');
            opt.value=p.codigo_acceso;
            opt.textContent=p.cuidapp_pacientes?.nombre||p.codigo_acceso;
            sel.appendChild(opt);
        });
    }

    function show(v){
        Object.values(views).forEach(el=>el.classList.remove('active'));
        views[v].classList.add('active');
    }

    async function getPacientePorCodigo(code){
        const { data, error } = await supabase
            .from('cuidapp_accesos')
            .select('paciente_id,cuidapp_pacientes:paciente_id(id,nombre,hospital_id,piso,habitacion,horario_visita)')
            .eq('codigo_acceso', code)
            .maybeSingle();
        if(error||!data) return null;
        const p=data.cuidapp_pacientes;
        p.codigo=code;
        return p;
    }

    async function crearPaciente(){
        const nombre=document.getElementById('pac-nombre').value.trim();
        if(!nombre) return;
        const hospital=document.getElementById('pac-hospital').value.trim();
        const piso=document.getElementById('pac-habitacion').value.trim();
        const horario=document.getElementById('pac-visitas').value.trim();
        const { data:pac, error } = await supabase
            .from('cuidapp_pacientes')
            .insert({nombre,hospital_id:hospital||null,piso,habitacion:piso,horario_visita:horario})
            .select()
            .single();
        if(error){ alert('Error al crear paciente'); return; }
        const code=Math.random().toString(36).substr(2,6);
        await supabase.from('cuidapp_accesos').insert({paciente_id:pac.id,codigo_acceso:code});
        alert('Código generado: '+code);
        show('login');
        await cargarListaPacientes();
    }

    async function cargarTurnos(){
        turnosCache={};
        const desde=new Date();
        const hasta=new Date(desde);hasta.setDate(hasta.getDate()+6);
        const { data } = await supabase
            .from('cuidapp_turnos')
            .select('id,fecha,franja,cuidapp_usuarios(nombre)')
            .eq('paciente_id', current.id)
            .gte('fecha', desde.toISOString().slice(0,10))
            .lte('fecha', hasta.toISOString().slice(0,10));
        (data||[]).forEach(t=>{
            const key=t.fecha;
            if(!turnosCache[key])turnosCache[key]={m:'',t:'',n:''};
            const map={"mañana":"m","tarde":"t","noche":"n"};
            const slot=map[t.franja];
            if(slot)turnosCache[key][slot]=t.cuidapp_usuarios? t.cuidapp_usuarios.nombre : '';
        });
        renderTurnos();
    }

    async function cargarBitacora(){
        const { data }= await supabase
            .from('cuidapp_bitacora')
            .select('fecha_hora,texto,cuidapp_usuarios(nombre)')
            .eq('paciente_id', current.id)
            .order('fecha_hora',{ascending:false});
        bitacoraCache=data||[];
        renderBitacora();
    }

    async function obtenerUsuarioId(nombre){
        if(!nombre) return null;
        let { data:user }=await supabase.from('cuidapp_usuarios').select('id').eq('nombre',nombre).maybeSingle();
        if(!user){
            const ins=await supabase.from('cuidapp_usuarios').insert({nombre}).select().single();
            user=ins.data;
        }
        return user?user.id:null;
    }

    async function actualizarTurno(fecha,slot,nombre){
        const franjaMap={m:'mañana',t:'tarde',n:'noche'};
        const franja=franjaMap[slot];
        if(!franja) return;
        const { data:ex }=await supabase.from('cuidapp_turnos')
            .select('id')
            .eq('paciente_id',current.id)
            .eq('fecha',fecha)
            .eq('franja',franja)
            .maybeSingle();
        if(nombre){
            const uid=await obtenerUsuarioId(nombre);
            if(ex) await supabase.from('cuidapp_turnos').update({usuario_id:uid}).eq('id',ex.id);
            else await supabase.from('cuidapp_turnos').insert({paciente_id:current.id,usuario_id:uid,fecha,franja});
        }else if(ex){
            await supabase.from('cuidapp_turnos').delete().eq('id',ex.id);
        }
        await cargarTurnos();
    }

    async function agregarBitacora(txt){
        const uid = await obtenerUsuarioId(nombreCuidador);
        await supabase.from('cuidapp_bitacora').insert({paciente_id:current.id,usuario_id:uid,texto:txt});
        await cargarBitacora();
    }

    function renderBitacora(){
        const div=document.getElementById('lista-bitacora');
        div.innerHTML='';
        bitacoraCache.forEach(b=>{
            const p=document.createElement('p');
            const autor = b.cuidapp_usuarios ? b.cuidapp_usuarios.nombre : '';

            const fecha = new Date(b.fecha_hora);
            fecha.setHours(fecha.getHours() - 3);
            p.textContent = `[${fecha.toLocaleString()}] ${autor ? autor + ': ' : ''}${b.texto}`;

            div.appendChild(p);
        });
    }

    async function listarPacientesAdmin(){
        const { data } = await supabase.from('cuidapp_pacientes').select('*').order('nombre');
        pacientesAdminCache = data || [];
        const cont = document.getElementById('admin-pacientes');
        if(!cont) return;
        cont.innerHTML='';
        pacientesAdminCache.forEach(p=>{
            const div=document.createElement('div');
            div.dataset.id=p.id;
            div.innerHTML=`<input data-field="nombre" value="${p.nombre||''}">`
                +`<input data-field="hospital" value="${p.hospital_id||''}">`
                +`<input data-field="habitacion" value="${p.piso||''}">`
                +`<input data-field="horario" value="${p.horario_visita||''}">`
                +`<button data-act="save">Guardar</button>`
                +`<button data-act="del">Eliminar</button>`
                +`<button data-act="gest">Turnos</button>`;
            cont.appendChild(div);
        });
        cont.querySelectorAll('button[data-act="save"]').forEach(b=>b.onclick=guardarPacienteAdmin);
        cont.querySelectorAll('button[data-act="del"]').forEach(b=>b.onclick=eliminarPacienteAdmin);
        cont.querySelectorAll('button[data-act="gest"]').forEach(b=>b.onclick=gestionarPacienteAdmin);
    }

    async function guardarPacienteAdmin(e){
        const div=e.target.parentElement;
        const id=div.dataset.id;
        const nombre=div.querySelector('input[data-field="nombre"]').value.trim();
        const hospital=div.querySelector('input[data-field="hospital"]').value.trim()||null;
        const hab=div.querySelector('input[data-field="habitacion"]').value.trim();
        const horario=div.querySelector('input[data-field="horario"]').value.trim();
        await supabase.from('cuidapp_pacientes').update({nombre,hospital_id:hospital,piso:hab,habitacion:hab,horario_visita:horario}).eq('id',id);
        await listarPacientesAdmin();
    }

    async function eliminarPacienteAdmin(e){
        const div=e.target.parentElement;
        const id=div.dataset.id;
        if(!confirm('Eliminar paciente?')) return;
        await supabase.from('cuidapp_accesos').delete().eq('paciente_id',id);
        await supabase.from('cuidapp_turnos').delete().eq('paciente_id',id);
        await supabase.from('cuidapp_bitacora').delete().eq('paciente_id',id);
        await supabase.from('cuidapp_pacientes').delete().eq('id',id);
        await listarPacientesAdmin();
    }

    function gestionarPacienteAdmin(e){
        const div=e.target.parentElement;
        const id=parseInt(div.dataset.id,10);
        const p=pacientesAdminCache.find(x=>x.id===id);
        if(p){
            current=p;
            renderTurnos();
            renderBitacora();
            show('turnos');
        }
    }



    function renderTurnos(){
        if(current){
            document.getElementById('turnos-nombre').textContent = `🤒 ${current.nombre}`;
            const hosp = current.hospital_id ? `🏥 ${current.hospital_id}` : '';
            const partes = [];
            if(current.piso || current.habitacion) partes.push(current.piso || current.habitacion);
            if(current.horario_visita) partes.push(`Visita de ${current.horario_visita}`);
            const info = partes.length ? `🏢 ${partes.join(' - ')}` : '';
            const hospEl = document.getElementById('turnos-hospital');
            if(hospEl) hospEl.textContent = hosp;
            document.getElementById('turnos-ubicacion').textContent = info;
        }else{
            document.getElementById('turnos-nombre').textContent='';
            const hospEl = document.getElementById('turnos-hospital');
            if(hospEl) hospEl.textContent='';
            document.getElementById('turnos-ubicacion').textContent='';
        }

        const table=document.getElementById('tabla-turnos');
        table.innerHTML='';
        const now=new Date();
        const header=document.createElement('tr');
        header.innerHTML='<th>Día</th><th>Mañana</th><th>Tarde</th><th>Noche</th>';
        table.appendChild(header);
        for(let i=0;i<7;i++){
            const d=new Date(now);d.setDate(now.getDate()+i);
            const key=d.toISOString().slice(0,10);
            if(!turnosCache[key])turnosCache[key]={m:'',t:'',n:''};
            const row=document.createElement('tr');
            row.innerHTML=`<td>${key}</td>`+
            `<td data-slot="m">${turnosCache[key].m}</td>`+
            `<td data-slot="t">${turnosCache[key].t}</td>`+
            `<td data-slot="n">${turnosCache[key].n}</td>`;
            row.querySelectorAll('td[data-slot]').forEach(td=>{
                const slot=td.getAttribute('data-slot');
                if(!turnosCache[key][slot]) td.classList.add('libre');
                else td.classList.remove('libre');
                td.onclick=async()=>{
                    const name=turnosCache[key][slot];
                    if(!name && nombreCuidador){
                        await actualizarTurno(key,slot,nombreCuidador);
                    }else{
                        const nuevo=prompt('Nombre del cuidador (vacío para liberar)', name || nombreCuidador || '');
                        if(nuevo===null)return;
                        await actualizarTurno(key,slot,nuevo.trim());
                    }
                };
            });
            table.appendChild(row);
        }
    }

    const selLogin=document.getElementById('login-select');
    document.getElementById('btn-show-create').onclick=()=>show('create');
    document.getElementById('btn-cancel-create').onclick=()=>show('login');
    document.getElementById('btn-create').onclick=crearPaciente;

    async function loginPorCodigo(code){
        const pac=await getPacientePorCodigo(code);
        if(!pac){alert('Código no encontrado');return;}
        current=pac;
        document.getElementById('dash-nombre').textContent=current.nombre;
        await cargarTurnos();
        await cargarBitacora();
        show('turnos');
    }

    selLogin.onchange=async()=>{
        const code=selLogin.value;
        if(code) await loginPorCodigo(code);
    };

    document.getElementById('btn-volver').onclick=()=>{current=null;show('login');};
    document.getElementById('goto-turnos').onclick=()=>{renderTurnos();renderBitacora();show('turnos');};
    document.getElementById('btn-volver-dash1').onclick=()=>show('dash');

    document.getElementById('btn-agregar-bitacora').onclick=async()=>{
        const txt=document.getElementById('bitacora-text').value.trim();
        if(!txt)return;
        document.getElementById('bitacora-text').value='';
        await agregarBitacora(txt);
    };


    document.getElementById('btn-admin-volver').onclick=()=>show('login');

    cargarListaPacientes();
})();
