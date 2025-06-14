// js/libros_ops.js
console.log("DEBUG: libros_ops.js - Cargado.");


async function pedirLibroPrestado(libroId, propietarioIdLibro, tituloLibro) {
    console.log(`DEBUG: libros_ops.js - Solicitando libro ID: ${libroId} al propietario ID: ${propietarioIdLibro}`);
    if (!currentUser || !currentUser.id) { console.error("Error de sesión."); return; }
    if (!supabaseClientInstance) { console.error("Error de conexión."); return; }
    if (currentUser.reputacion <= -3) { console.warn("Límite de préstamos alcanzado."); return; }

    const botonesLibro = document.querySelectorAll(`.libro-card[data-libro-id="${libroId}"] button`);
    botonesLibro.forEach(b => b.disabled = true);
    try {
        const { error: insErr } = await supabaseClientInstance.from('solicitudes_prestamo').insert({
            libro_id: libroId,
            propietario_id: propietarioIdLibro,
            solicitante_id: currentUser.id,
            fecha_solicitud: new Date().toISOString(),
            estado_solicitud: 'pendiente'
        });
        if (insErr) throw insErr;

        const { data: repData, error: repErr } = await supabaseClientInstance
            .from('usuarios')
            .select('reputacion')
            .eq('id', currentUser.id)
            .single();
        if (repErr) throw repErr;
        const nuevaRep = (repData?.reputacion || 0) - 1;
        await supabaseClientInstance.from('usuarios')
            .update({ reputacion: nuevaRep })
            .eq('id', currentUser.id);
        currentUser.reputacion = nuevaRep;

        await supabaseClientInstance.from('libros')
            .update({ estado: 'solicitado' })
            .eq('id', libroId)
            .eq('estado', 'disponible');
        console.log(`DEBUG: libros_ops.js - Solicitud creada para libro ${libroId}.`);
        if (tituloLibro) {
            agregarNotificacion(propietarioIdLibro, `${currentUser.nickname} solicitó prestado "${tituloLibro}"`);
        }
    } catch (error) {
        console.error('DEBUG: libros_ops.js - Error al solicitar libro:', error);
    } finally {
        cargarYMostrarLibros();
        recargarSeccionesPrestamosDashboard();
        botonesLibro.forEach(b => b.disabled = false);
        actualizarMenuPrincipal();
    }

}

async function marcarLibroComoDevuelto(libroId) {
    // ... (Misma función marcarLibroComoDevuelto que tenías)
    console.log(`DEBUG: libros_ops.js - Intentando marcar devuelto libro ID: ${libroId}`);
    if (!currentUser || !currentUser.id) { console.error("Error de sesión."); return; }
    if (!supabaseClientInstance) { console.error("Error de conexión."); return; }
    console.log(`DEBUG: libros_ops.js - ID del usuario (propietario devolviendo): ${currentUser.id}`);
    try {
        const { data: libroActual, error: fetchErr } = await supabaseClientInstance
            .from('libros')
            .select('titulo, propietario_id')
            .eq('id', libroId)
            .single();
        if (fetchErr) throw fetchErr;

        const { data: prestamoActivo } = await supabaseClientInstance
            .from('prestamos')
            .select('id, prestatario_id')
            .eq('libro_id', libroId)
            .eq('estado', 'activo')
            .single();

        const { data, error } = await supabaseClientInstance
            .from('libros')
            .update({ estado: 'disponible' })
            .eq('id', libroId)
            .eq('propietario_id', currentUser.id)
            .eq('estado', 'prestado')
            .select();
        if (error) throw error;
        if (!data || data.length === 0) {
            console.warn(`DEBUG: libros_ops.js - No se actualizó libro ID: ${libroId} a devuelto.`);
        } else {
            console.log(`DEBUG: libros_ops.js - Libro ID: ${libroId} marcado como 'disponible'.`);
        }
        if (prestamoActivo && prestamoActivo.prestatario_id) {
            await supabaseClientInstance
                .from('prestamos')
                .update({ fecha_devolucion: new Date().toISOString(), estado: 'devuelto' })
                .eq('id', prestamoActivo.id);

            const { data: repPrest } = await supabaseClientInstance.from('usuarios').select('reputacion').eq('id', prestamoActivo.prestatario_id).single();
            if (repPrest) {
                const nuevaRep = (repPrest.reputacion || 0) + 1;
                await supabaseClientInstance.from('usuarios').update({ reputacion: nuevaRep }).eq('id', prestamoActivo.prestatario_id);
                if (currentUser.id === prestamoActivo.prestatario_id) currentUser.reputacion = nuevaRep;
            }
            agregarNotificacion(prestamoActivo.prestatario_id, `Se registró la devolución de "${libroActual.titulo}"`);
        }
    } catch (error) {
        console.error("DEBUG: libros_ops.js - Error al marcar devuelto:", error);
    } finally {
        cargarYMostrarLibros();
        recargarSeccionesPrestamosDashboard();
        actualizarMenuPrincipal();
    }
}


async function responderSolicitudPrestamo(solicitudId, libroId, solicitanteId, propietarioId, nuevoEstado, libroTitulo, solicitanteNickname) {
    console.log(`DEBUG: libros_ops.js - Respondiendo solicitud ${solicitudId} con estado ${nuevoEstado}`);
    if (!supabaseClientInstance || !currentUser) { console.error("DEBUG: libros_ops.js - Supabase o usuario no inicializado."); return; }
    try {
        const { error } = await supabaseClientInstance
            .from("solicitudes_prestamo")
            .update({ estado_solicitud: nuevoEstado })
            .eq("id", solicitudId);
        if (error) throw error;
        if (nuevoEstado === "aceptada" && libroId) {
            const fechaDev = new Date();
            fechaDev.setDate(fechaDev.getDate() + 14);

            await supabaseClientInstance.from('prestamos').insert({
                libro_id: libroId,
                propietario_id: propietarioId,
                prestatario_id: solicitanteId,
                fecha_prestamo: new Date().toISOString(),
                fecha_limite_devolucion: fechaDev.toISOString(),
                estado: 'activo'
            });

            await supabaseClientInstance.from("libros")
                .update({ estado: "prestado" })
                .eq("id", libroId)
                .eq("propietario_id", propietarioId);
            const { data: repSol } = await supabaseClientInstance.from('usuarios').select('reputacion').eq('id', solicitanteId).single();
            if (repSol) {
                const nRS = (repSol.reputacion || 0) - 1;
                await supabaseClientInstance.from('usuarios').update({ reputacion: nRS }).eq('id', solicitanteId);
                if (currentUser.id === solicitanteId) currentUser.reputacion = nRS;
            }
            const { data: repProp } = await supabaseClientInstance.from('usuarios').select('reputacion').eq('id', propietarioId).single();
            if (repProp) {
                const nRP = (repProp.reputacion || 0) + 1;
                await supabaseClientInstance.from('usuarios').update({ reputacion: nRP }).eq('id', propietarioId);
                if (currentUser.id === propietarioId) currentUser.reputacion = nRP;
            }
            agregarNotificacion(solicitanteId, `Tu solicitud para "${libroTitulo}" fue aceptada`);
            await refrescarNotificaciones();
        } else if (nuevoEstado === 'rechazada' && libroId) {
            const { data: pendientes } = await supabaseClientInstance
                .from('solicitudes_prestamo')
                .select('id')
                .eq('libro_id', libroId)
                .eq('estado_solicitud', 'pendiente');
            if (!pendientes || pendientes.length === 0) {
                await supabaseClientInstance.from('libros')
                    .update({ estado: 'disponible' })
                    .eq('id', libroId)
                    .eq('propietario_id', propietarioId);
            }
            agregarNotificacion(solicitanteId, `Tu solicitud para "${libroTitulo}" fue rechazada`);
            await refrescarNotificaciones();
        }
        console.log(`DEBUG: libros_ops.js - Solicitud ${solicitudId} actualizada a ${nuevoEstado}.`);
    } catch (err) {
        console.error("DEBUG: libros_ops.js - Error procesando solicitud:", err);
    } finally {
        const solicitudes = await cargarSolicitudesRecibidas(currentUser.id);
        renderizarNovedadesPendientes("lista-novedades", notificaciones, solicitudes);
        asignarEventListenersLibros();
        cargarYMostrarLibros();
        recargarSeccionesPrestamosDashboard();
        actualizarMenuPrincipal();
    }

}


async function handleAnadirLibroSubmit(event) {
    // ... (Misma función handleAnadirLibroSubmit que tenías)
    event.preventDefault(); console.log("DEBUG: libros_ops.js - Guardando nuevo libro...");
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return; }
    const titulo = document.getElementById('libro-titulo').value; const fotoInput = document.getElementById('libro-foto'); const fotoFile = fotoInput.files[0];
    if (!titulo || !fotoFile) { alert("Por favor, completa el título y selecciona una foto."); return; }
    if (!currentUser || !currentUser.id) { alert("Error: No se pudo identificar al usuario."); renderizarVistaBienvenida(); return; } // Asume renderizarVistaBienvenida es global
    const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = 'Guardando...';
    try {
        const nombreArchivoFoto = `${currentUser.id}_${Date.now()}_${fotoFile.name}`;
        const { error: errorSubida } = await supabaseClientInstance.storage.from('portadas-libros').upload(nombreArchivoFoto, fotoFile, { cacheControl: '3600', upsert: false });
        if (errorSubida) { throw errorSubida; }
        const { data: dataUrlPublica } = supabaseClientInstance.storage.from('portadas-libros').getPublicUrl(nombreArchivoFoto);
        const urlFotoPublica = dataUrlPublica.publicUrl; console.log("DEBUG: libros_ops.js - Foto subida, URL pública:", urlFotoPublica);
        const { error: errorLibro } = await supabaseClientInstance.from('libros').insert([{ titulo: titulo, foto_url: urlFotoPublica, google_link: `https://www.google.com/search?q=${encodeURIComponent(titulo)}`, propietario_id: currentUser.id, estado: 'disponible' }]).select();
        if (errorLibro) { throw errorLibro; }
        console.log("Libro añadido exitosamente."); document.getElementById('form-anadir-libro').reset();
        const previewFoto = document.getElementById('libro-foto-preview'); if(previewFoto) { previewFoto.src = '#'; previewFoto.style.display = 'none'; }
        renderizarDashboard(); // Asume renderizarDashboard es global
    } catch (error) { console.error("DEBUG: libros_ops.js - Error al guardar el libro:", error); 
    } finally { submitButton.disabled = false; submitButton.textContent = 'Guardar Libro'; }
}

async function recargarSeccionesPrestamosDashboard() {
    if (!currentUser) return;
    if (document.getElementById('mis-libros-en-prestamo')) {
        cargarMisLibrosEnPrestamo(currentUser.id).then(libros => {
            renderizarListaDashboard('mis-libros-en-prestamo', libros, 'prestadosPorMi');
            asignarEventListenersLibros();
        });
    }
    if (document.getElementById('libros-que-me-prestaron')) {
        cargarLibrosQueMePrestaron(currentUser.id).then(libros => {
            renderizarListaDashboard('libros-que-me-prestaron', libros, 'prestadosAMi');
        });
    }

    if (document.getElementById('lista-novedades')) {
        const solicitudes = await cargarSolicitudesRecibidas(currentUser.id);
        renderizarNovedadesPendientes('lista-novedades', notificaciones, solicitudes);
        asignarEventListenersLibros();
    }
}

