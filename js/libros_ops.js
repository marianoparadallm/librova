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
        const { data: prestamoActivo, error: prestErr } = await supabaseClientInstance
            .from('prestamos')
            .select('id, propietario_id, prestatario_id')
            .eq('libro_id', libroId)
            .eq('estado', 'activo')
            .single();
        if (prestErr) throw prestErr;
        if (!prestamoActivo || (currentUser.id !== prestamoActivo.propietario_id && currentUser.id !== prestamoActivo.prestatario_id)) {
            console.warn('DEBUG: libros_ops.js - Usuario no autorizado a marcar devolución');
            return;
        }

        const { data: libroActual, error: fetchErr } = await supabaseClientInstance
            .from('libros')
            .select('titulo')
            .eq('id', libroId)
            .single();
        if (fetchErr) throw fetchErr;

        const { data, error } = await supabaseClientInstance
            .from('libros')
            .update({ estado: 'disponible' })
            .eq('id', libroId)
            .eq('estado', 'prestado')
            .select();
        if (error) throw error;
        if (!data || data.length === 0) {
            console.warn(`DEBUG: libros_ops.js - No se actualizó libro ID: ${libroId} a devuelto.`);
        } else {
            console.log(`DEBUG: libros_ops.js - Libro ID: ${libroId} marcado como 'disponible'.`);
        }
        if (prestamoActivo) {
            await supabaseClientInstance
                .from('prestamos')
                .update({ fecha_devolucion: new Date().toISOString(), estado: 'devuelto' })
                .eq('id', prestamoActivo.id);

            const { data: repPrest } = await supabaseClientInstance
                .from('usuarios')
                .select('reputacion')
                .eq('id', prestamoActivo.prestatario_id)
                .single();
            if (repPrest) {
                const nuevaRep = (repPrest.reputacion || 0) + 1;
                await supabaseClientInstance.from('usuarios').update({ reputacion: nuevaRep }).eq('id', prestamoActivo.prestatario_id);
                if (currentUser.id === prestamoActivo.prestatario_id) currentUser.reputacion = nuevaRep;
            }

            const { data: repProp } = await supabaseClientInstance
                .from('usuarios')
                .select('reputacion')
                .eq('id', prestamoActivo.propietario_id)
                .single();
            if (repProp) {
                const nuevaRepProp = (repProp.reputacion || 0) + 1;
                await supabaseClientInstance.from('usuarios').update({ reputacion: nuevaRepProp }).eq('id', prestamoActivo.propietario_id);
                if (currentUser.id === prestamoActivo.propietario_id) currentUser.reputacion = nuevaRepProp;
            }

            actualizarMenuPrincipal();
            const dash = document.getElementById('vista-dashboard');
            if (dash && dash.classList.contains('activa')) {
                renderizarDashboard();
            }
            agregarNotificacion(prestamoActivo.propietario_id, `Se registró la devolución de "${libroActual.titulo}"`);
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
                actualizarMenuPrincipal();
                const dash = document.getElementById('vista-dashboard');
                if (dash && dash.classList.contains('activa')) {
                    renderizarDashboard();
                }
            }
            const { data: repProp } = await supabaseClientInstance.from('usuarios').select('reputacion').eq('id', propietarioId).single();
            if (repProp) {
                const nRP = (repProp.reputacion || 0) + 1;
                await supabaseClientInstance.from('usuarios').update({ reputacion: nRP }).eq('id', propietarioId);
                if (currentUser.id === propietarioId) currentUser.reputacion = nRP;
                actualizarMenuPrincipal();
                const dash = document.getElementById('vista-dashboard');
                if (dash && dash.classList.contains('activa')) {
                    renderizarDashboard();
                }
            }
            agregarNotificacion(solicitanteId, `Tu solicitud para "${libroTitulo}" fue aceptada`);
            await refrescarNotificaciones();
            mostrarPopupMensaje(`Recuerda llevarle \"${libroTitulo}\" a ${solicitanteNickname} mañana al aula.`);
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
            mostrarPopupMensaje(`Has rechazado la solicitud para \"${libroTitulo}\".`);
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

async function solicitarDevolucionAnticipada(libroId, prestatarioId, tituloLibro, fechaDev) {

    console.log(`DEBUG: libros_ops.js - Solicitar devolución anticipada para libro ${libroId}`);
    if (!supabaseClientInstance || !currentUser) {
        console.error("DEBUG: libros_ops.js - Supabase o usuario no inicializado.");
        return;
    }
    try {
        const { data: repData } = await supabaseClientInstance
            .from('usuarios')
            .select('reputacion')
            .eq('id', prestatarioId)
            .single();
        if (repData) {
            const nuevaRep = (repData.reputacion || 0) - 1;
            await supabaseClientInstance
                .from('usuarios')
                .update({ reputacion: nuevaRep })
                .eq('id', prestatarioId);
            if (currentUser.id === prestatarioId) currentUser.reputacion = nuevaRep;
        }

        if (prestatarioId) {
            agregarNotificacion(prestatarioId, `${currentUser.nickname} solicitó la devolución anticipada de '${tituloLibro}'`);
        }
    } catch (error) {
        console.error('DEBUG: libros_ops.js - Error solicitando devolución anticipada:', error);
    } finally {
        recargarSeccionesPrestamosDashboard();
        actualizarMenuPrincipal();
    }
}


async function actualizarLibroPropio(libroId, campos) {
    console.log(`DEBUG: libros_ops.js - Actualizando libro ID: ${libroId}`, campos);
    if (!supabaseClientInstance || !currentUser) return null;
    try {
        const { data, error } = await supabaseClientInstance
            .from('libros')
            .update(campos)
            .eq('id', libroId)
            .eq('propietario_id', currentUser.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('DEBUG: libros_ops.js - Error actualizar libro:', err);
        return null;
    }
}

async function eliminarLibroPropio(libroId) {
    console.log(`DEBUG: libros_ops.js - Eliminando libro ID: ${libroId}`);
    if (!supabaseClientInstance || !currentUser) return false;
    try {
        const { error } = await supabaseClientInstance
            .from('libros')
            .delete()
            .eq('id', libroId)
            .eq('propietario_id', currentUser.id)
            .eq('estado', 'disponible');
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('DEBUG: libros_ops.js - Error eliminar libro:', err);
        return false;
    }
}


async function handleAnadirLibroSubmit(event) {
    // ... (Misma función handleAnadirLibroSubmit que tenías)
    event.preventDefault(); console.log("DEBUG: libros_ops.js - Guardando nuevo libro...");
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return; }
    const titulo = document.getElementById('libro-titulo').value; const fotoInput = document.getElementById('libro-foto'); const fotoFile = fotoInput.files[0]; const archivoInput = document.getElementById('libro-digital'); const archivoFile = archivoInput ? archivoInput.files[0] : null; const tipoLibro=document.getElementById('libro-tipo')?document.getElementById('libro-tipo').value:'fisico';
    if (!titulo || !fotoFile) { alert("Por favor, completa el título y selecciona una foto."); return; }
    if(tipoLibro==='digital' && !archivoFile){alert('Debes subir el archivo digital del libro.');return;}
    if (!currentUser || !currentUser.id) { alert("Error: No se pudo identificar al usuario."); renderizarVistaBienvenida(); return; } // Asume renderizarVistaBienvenida es global
    const submitButton = event.target.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = 'Guardando...';
    try {
        const nombreArchivoFoto = `${currentUser.id}_${Date.now()}_${fotoFile.name}`;
        const { error: errorSubida } = await supabaseClientInstance.storage.from('portadas-libros').upload(nombreArchivoFoto, fotoFile, { cacheControl: '3600', upsert: false });
        if (errorSubida) { throw errorSubida; }
        const { data: dataUrlPublica } = supabaseClientInstance.storage.from('portadas-libros').getPublicUrl(nombreArchivoFoto);
        const urlFotoPublica = dataUrlPublica.publicUrl; console.log("DEBUG: libros_ops.js - Foto subida, URL pública:", urlFotoPublica);
        let urlArchivoPublico = null;
        if (archivoFile) {
            const nombreArchivoDigital = `${currentUser.id}_${Date.now()}_${archivoFile.name}`;
            const { error: errArchivo } = await supabaseClientInstance.storage.from('libros-digitales').upload(nombreArchivoDigital, archivoFile, { cacheControl: '3600', upsert: false });
            if (errArchivo) throw errArchivo;
            const { data: dataArchivo } = supabaseClientInstance.storage.from('libros-digitales').getPublicUrl(nombreArchivoDigital);
            urlArchivoPublico = dataArchivo.publicUrl;
        }
        const { error: errorLibro } = await supabaseClientInstance.from('libros').insert([{ titulo: titulo, foto_url: urlFotoPublica, archivo_url: urlArchivoPublico, google_link: `https://www.google.com/search?q=${encodeURIComponent(titulo)}`, propietario_id: currentUser.id, estado: 'disponible' }]).select();
        if (errorLibro) { throw errorLibro; }
        console.log("Libro añadido exitosamente."); document.getElementById('form-anadir-libro').reset();
        const previewFoto = document.getElementById('libro-foto-preview'); if(previewFoto) { previewFoto.src = '#'; previewFoto.style.display = 'none'; }
        renderizarDashboard(); // Asume renderizarDashboard es global
    } catch (error) { console.error("DEBUG: libros_ops.js - Error al guardar el libro:", error); 
    } finally { submitButton.disabled = false; submitButton.textContent = 'Guardar Libro'; }
}

async function editarLibroPropio(libroId, { titulo, fotoFile, archivoFile }) {
    if (!supabaseClientInstance || !currentUser) {
        alert('Error: sesión no disponible.');
        return null;
    }
    const campos = {};
    if (titulo) campos.titulo = titulo;
    try {
        if (fotoFile) {
            const nombreArchivoFoto = `${currentUser.id}_${Date.now()}_${fotoFile.name}`;
            const { error: errorSubida } = await supabaseClientInstance.storage
                .from('portadas-libros')
                .upload(nombreArchivoFoto, fotoFile, { cacheControl: '3600', upsert: false });
            if (errorSubida) throw errorSubida;
            const { data } = supabaseClientInstance.storage
                .from('portadas-libros')
                .getPublicUrl(nombreArchivoFoto);
            campos.foto_url = data.publicUrl;
        }
        if (archivoFile) {
            const nombreArchivoDigital = `${currentUser.id}_${Date.now()}_${archivoFile.name}`;
            const { error: errArchivo } = await supabaseClientInstance.storage
                .from('libros-digitales')
                .upload(nombreArchivoDigital, archivoFile, { cacheControl: '3600', upsert: false });
            if (errArchivo) throw errArchivo;
            const { data: dataArchivo } = supabaseClientInstance.storage
                .from('libros-digitales')
                .getPublicUrl(nombreArchivoDigital);
            campos.archivo_url = dataArchivo.publicUrl;
        }
        if (Object.keys(campos).length === 0) return null;
        const { data: libroEditado, error } = await supabaseClientInstance
            .from('libros')
            .update(campos)
            .eq('id', libroId)
            .eq('propietario_id', currentUser.id)
            .select()
            .single();
        if (error) throw error;
        return libroEditado;
    } catch (err) {
        console.error('DEBUG: libros_ops.js - Error editar libro:', err);
        return null;
    }
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

// Exponer helpers a nivel global
window.actualizarLibroPropio = actualizarLibroPropio;
window.eliminarLibroPropio = eliminarLibroPropio;

