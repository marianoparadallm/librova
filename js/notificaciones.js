// js/notificaciones.js
console.log("DEBUG: notificaciones.js - Cargado.");

async function agregarNotificacion(usuarioId, mensaje) {
    if (!supabaseClientInstance) return;
    try {
        await supabaseClientInstance.from('notificaciones').insert({
            usuario_id: usuarioId,
            mensaje,
            leida: false,
            created_at: new Date().toISOString()
        });
    } catch (e) {
        console.error('DEBUG: notificaciones.js - Error al agregar notificación:', e);
    }
}

async function cargarNotificacionesUsuario(usuarioId) {
    if (!supabaseClientInstance) return [];
    try {
        const { data, error } = await supabaseClientInstance
            .from('notificaciones')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('DEBUG: notificaciones.js - Error cargando notificaciones:', e);
        return [];
    }
}

async function marcarNotificacionesLeidas(ids) {
    if (!supabaseClientInstance || !ids || ids.length === 0) return;
    try {
        await supabaseClientInstance.from('notificaciones')
            .update({ leida: true })
            .in('id', ids);
    } catch (e) {
        console.error('DEBUG: notificaciones.js - Error marcando notificaciones como leídas:', e);
    }
}

window.agregarNotificacion = agregarNotificacion;
window.cargarNotificacionesUsuario = cargarNotificacionesUsuario;
window.marcarNotificacionesLeidas = marcarNotificacionesLeidas;

async function eliminarNotificacion(id) {
    if (!supabaseClientInstance) return;
    try {
        await supabaseClientInstance
            .from('notificaciones')
            .delete()
            .eq('id', id);
    } catch (e) {
        console.error('DEBUG: notificaciones.js - Error al eliminar notificación:', e);
    }
}

window.eliminarNotificacion = eliminarNotificacion;

async function refrescarNotificaciones() {
    if (!currentUser) return;
    const idsPrevios = notificaciones.map(n => n.id);
    notificaciones = await cargarNotificacionesUsuario(currentUser.id);
    const noLeidas = notificaciones.filter(n => !n.leida);
    notificacionesNuevas = noLeidas.length;
    const nuevasEntradas = noLeidas.filter(n => !idsPrevios.includes(n.id));
    actualizarMenuPrincipal();
    nuevasEntradas.forEach(nueva => mostrarPopupMensaje(nueva.mensaje));
}

window.refrescarNotificaciones = refrescarNotificaciones;

function iniciarMonitoreoNotificaciones() {
    detenerMonitoreoNotificaciones();
    if (!currentUser) return;
    refrescarNotificaciones();
    notificacionesIntervalId = setInterval(refrescarNotificaciones, 60000);
}

function detenerMonitoreoNotificaciones() {
    if (notificacionesIntervalId) {
        clearInterval(notificacionesIntervalId);
        notificacionesIntervalId = null;
    }
}

window.iniciarMonitoreoNotificaciones = iniciarMonitoreoNotificaciones;
window.detenerMonitoreoNotificaciones = detenerMonitoreoNotificaciones;
