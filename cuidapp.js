(function(){
    const views={
        login:document.getElementById('view-login'),
        create:document.getElementById('view-create'),
        dash:document.getElementById('view-dashboard'),
        turnos:document.getElementById('view-turnos'),
        bitacora:document.getElementById('view-bitacora'),
        info:document.getElementById('view-info')
    };
    let pacientes=JSON.parse(localStorage.getItem('cuidapp_pacientes')||'{}');
    let current=null;

    function save(){
        localStorage.setItem('cuidapp_pacientes',JSON.stringify(pacientes));
    }
    function show(v){
        Object.values(views).forEach(el=>el.classList.remove('active'));
        views[v].classList.add('active');
    }

    document.getElementById('link-create').onclick=e=>{e.preventDefault();show('create');};
    document.getElementById('btn-cancel-create').onclick=()=>show('login');

    document.getElementById('btn-create').onclick=()=>{
        const nombre=document.getElementById('pac-nombre').value.trim();
        if(!nombre) return;
        const code=Math.random().toString(36).substr(2,6);
        pacientes[code]={
            code,
            nombre,
            hospital:document.getElementById('pac-hospital').value.trim(),
            habitacion:document.getElementById('pac-habitacion').value.trim(),
            visitas:document.getElementById('pac-visitas').value.trim(),
            turnos:{},
            bitacora:[]
        };
        save();
        alert('Código generado: '+code);
        document.getElementById('login-code').value=code;
        show('login');
    };

    document.getElementById('btn-login').onclick=()=>{
        const code=document.getElementById('login-code').value.trim();
        if(!pacientes[code]){alert('Código no encontrado');return;}
        current=pacientes[code];
        document.getElementById('dash-nombre').textContent=current.nombre;
        updateInfo();
        show('dash');
    };

    document.getElementById('btn-logout').onclick=()=>{current=null;show('login');};
    document.getElementById('goto-turnos').onclick=()=>{renderTurnos();show('turnos');};
    document.getElementById('goto-bitacora').onclick=()=>{renderBitacora();show('bitacora');};
    document.getElementById('goto-info').onclick=()=>{updateInfo();show('info');};
    document.getElementById('btn-volver-dash1').onclick=document.getElementById('btn-volver-dash2').onclick=document.getElementById('btn-volver-dash3').onclick=()=>show('dash');

    document.getElementById('btn-agregar-bitacora').onclick=()=>{
        const txt=document.getElementById('bitacora-text').value.trim();
        if(!txt)return;
        current.bitacora.push({texto:txt,fecha:new Date().toLocaleString()});
        document.getElementById('bitacora-text').value='';
        save();
        renderBitacora();
    };

    function renderBitacora(){
        const div=document.getElementById('lista-bitacora');
        div.innerHTML='';
        current.bitacora.forEach(b=>{
            const p=document.createElement('p');
            p.textContent=`[${b.fecha}] ${b.texto}`;
            div.appendChild(p);
        });
    }

    function updateInfo(){
        const info=document.getElementById('info-detalle');
        info.innerHTML=`<p><strong>Hospital:</strong> ${current.hospital}</p>`+
            `<p><strong>Habitación:</strong> ${current.habitacion}</p>`+
            `<p><strong>Visitas:</strong> ${current.visitas}</p>`;
        updateCoverStatus();
    }

    function renderTurnos(){
        const table=document.getElementById('tabla-turnos');
        table.innerHTML='';
        const now=new Date();
        const header=document.createElement('tr');
        header.innerHTML='<th>Día</th><th>Mañana</th><th>Tarde</th><th>Noche</th>';
        table.appendChild(header);
        for(let i=0;i<7;i++){
            const d=new Date(now);d.setDate(now.getDate()+i);
            const key=d.toISOString().slice(0,10);
            if(!current.turnos[key])current.turnos[key]={m:'',t:'',n:''};
            const row=document.createElement('tr');
            row.innerHTML=`<td>${key}</td>`+
            `<td data-slot="m">${current.turnos[key].m}</td>`+
            `<td data-slot="t">${current.turnos[key].t}</td>`+
            `<td data-slot="n">${current.turnos[key].n}</td>`;
            row.querySelectorAll('td[data-slot]').forEach(td=>{
                td.onclick=()=>{
                    const slot=td.getAttribute('data-slot');
                    const name=current.turnos[key][slot];
                    const nuevo=prompt('Nombre del cuidador (vacío para liberar)',name);
                    if(nuevo===null)return;
                    current.turnos[key][slot]=nuevo.trim();
                    td.textContent=current.turnos[key][slot];
                    save();
                    updateCoverStatus();
                };
            });
            table.appendChild(row);
        }
    }

    function updateCoverStatus(){
        let total=0,ocupados=0;
        for(const d of Object.values(current.turnos)){
            ['m','t','n'].forEach(s=>{total++;if(d[s])ocupados++;});
        }
        const perc=total?Math.round(ocupados*100/total):0;
        document.getElementById('cover-status').textContent=`Cobertura: ${perc}%`;
    }
})();
