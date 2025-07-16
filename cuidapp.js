(function(){
    const views={
        login:document.getElementById('view-login'),
        create:document.getElementById('view-create'),
        dash:document.getElementById('view-dashboard'),
        turnos:document.getElementById('view-turnos'),
        bitacora:document.getElementById('view-bitacora'),
        info:document.getElementById('view-info')
    };

    const supabase = window.supabase.createClient(X_SUPABASE_URL, X_SUPABASE_ANON_KEY);
    let current=null;
    let turnosCache={};
    let bitacoraCache=[];

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
            .insert({nombre,hospital_id:null,piso,habitacion:piso,horario_visita:horario})
            .select()
            .single();
        if(error){ alert('Error al crear paciente'); return; }
        const code=Math.random().toString(36).substr(2,6);
        await supabase.from('cuidapp_accesos').insert({paciente_id:pac.id,codigo_acceso:code});
        alert('Código generado: '+code);
        document.getElementById('login-code').value=code;
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
            .select('fecha_hora,texto')
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
        await supabase.from('cuidapp_bitacora').insert({paciente_id:current.id,texto:txt});
        await cargarBitacora();
    }

    function renderBitacora(){
        const div=document.getElementById('lista-bitacora');
        div.innerHTML='';
        bitacoraCache.forEach(b=>{
            const p=document.createElement('p');
            p.textContent=`[${new Date(b.fecha_hora).toLocaleString()}] ${b.texto}`;
            div.appendChild(p);
        });
    }

    function renderTurnos(){
        document.getElementById('turnos-nombre').textContent=current?current.nombre:'';
        document.getElementById('turnos-ubicacion').textContent=current&&current.habitacion?`Habitación: ${current.habitacion}`:'';

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
                    const nuevo=prompt('Nombre del cuidador (vacío para liberar)',name);
                    if(nuevo===null)return;
                    await actualizarTurno(key,slot,nuevo.trim());
                };
            });
            table.appendChild(row);
        }
        updateCoverStatus();
    }

    function updateInfo(){
        const info=document.getElementById('info-detalle');
        info.innerHTML=`<p><strong>Habitación:</strong> ${current.habitacion||''}</p>`+
            `<p><strong>Visitas:</strong> ${current.horario_visita||''}</p>`;
        updateCoverStatus();
    }

    function updateCoverStatus(){
        let total=0,ocupados=0;
        for(const d of Object.values(turnosCache)){
            ['m','t','n'].forEach(s=>{total++;if(d[s])ocupados++;});
        }
        const perc=total?Math.round(ocupados*100/total):0;
        document.getElementById('cover-status').textContent=`Cobertura: ${perc}%`;
    }

    document.getElementById('link-create').onclick=e=>{e.preventDefault();show('create');};
    document.getElementById('btn-cancel-create').onclick=()=>show('login');
    document.getElementById('btn-create').onclick=crearPaciente;

    document.getElementById('btn-login').onclick=async()=>{
        const sel=document.getElementById('login-select');
        const code=(sel && sel.value) || document.getElementById('login-code').value.trim();
        const pac=await getPacientePorCodigo(code);
        if(!pac){alert('Código no encontrado');return;}
        current=pac;
        document.getElementById('dash-nombre').textContent=current.nombre;
        await cargarTurnos();
        await cargarBitacora();
        updateInfo();
        show('turnos');
    };

    document.getElementById('btn-logout').onclick=()=>{current=null;show('login');};
    document.getElementById('goto-turnos').onclick=()=>{renderTurnos();show('turnos');};
    document.getElementById('goto-bitacora').onclick=()=>{renderBitacora();show('bitacora');};
    document.getElementById('goto-info').onclick=()=>{updateInfo();show('info');};
    document.getElementById('btn-volver-dash1').onclick=document.getElementById('btn-volver-dash2').onclick=document.getElementById('btn-volver-dash3').onclick=()=>show('dash');

    document.getElementById('btn-agregar-bitacora').onclick=async()=>{
        const txt=document.getElementById('bitacora-text').value.trim();
        if(!txt)return;
        document.getElementById('bitacora-text').value='';
        await agregarBitacora(txt);
    };

    const sel=document.getElementById('login-select');
    if(sel){
        sel.onchange=()=>{ document.getElementById('login-code').value=sel.value; };
    }
    cargarListaPacientes();
})();
