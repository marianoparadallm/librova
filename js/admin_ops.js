// js/admin_ops.js
console.log("DEBUG: admin_ops.js - Cargado.");

async function listarLibrosAdmin() {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('libros').select('*').order('id', { ascending: true });
    if (error) { console.error('DEBUG: admin_ops.js - Error listar libros:', error); return []; }
    return data || [];
}

async function crearLibroAdmin(libro) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('libros').insert(libro).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error crear libro:', error); return null; }
    return data;
}

async function editarLibroAdmin(id, campos) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('libros').update(campos).eq('id', id).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error editar libro:', error); return null; }
    return data;
}

async function eliminarLibroAdmin(id) {
    if (!supabaseClientInstance) return;
    const { error } = await supabaseClientInstance.from('libros').delete().eq('id', id);
    if (error) console.error('DEBUG: admin_ops.js - Error eliminar libro:', error);
}

async function listarUsuariosAdmin() {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('usuarios').select('*').order('id', { ascending: true });
    if (error) { console.error('DEBUG: admin_ops.js - Error listar usuarios:', error); return []; }
    return data || [];
}

async function crearUsuarioAdmin(usuario) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('usuarios').insert(usuario).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error crear usuario:', error); return null; }
    return data;
}

async function editarUsuarioAdmin(id, campos) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('usuarios').update(campos).eq('id', id).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error editar usuario:', error); return null; }
    return data;
}

async function eliminarUsuarioAdmin(id) {
    if (!supabaseClientInstance) return;
    const { error } = await supabaseClientInstance.from('usuarios').delete().eq('id', id);
    if (error) console.error('DEBUG: admin_ops.js - Error eliminar usuario:', error);
}

async function listarSolicitudesAdmin() {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('solicitudes_prestamo').select('*').order('id', { ascending: true });
    if (error) { console.error('DEBUG: admin_ops.js - Error listar solicitudes:', error); return []; }
    return data || [];
}

async function crearSolicitudAdmin(solicitud) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('solicitudes_prestamo').insert(solicitud).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error crear solicitud:', error); return null; }
    return data;
}

async function editarSolicitudAdmin(id, campos) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('solicitudes_prestamo').update(campos).eq('id', id).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error editar solicitud:', error); return null; }
    return data;
}

async function eliminarSolicitudAdmin(id) {
    if (!supabaseClientInstance) return;
    const { error } = await supabaseClientInstance.from('solicitudes_prestamo').delete().eq('id', id);
    if (error) console.error('DEBUG: admin_ops.js - Error eliminar solicitud:', error);
}

async function listarPrestamosAdmin() {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('prestamos').select('*').order('id', { ascending: true });
    if (error) { console.error('DEBUG: admin_ops.js - Error listar prestamos:', error); return []; }
    return data || [];
}

async function crearPrestamoAdmin(prestamo) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('prestamos').insert(prestamo).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error crear prestamo:', error); return null; }
    return data;
}

async function editarPrestamoAdmin(id, campos) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('prestamos').update(campos).eq('id', id).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error editar prestamo:', error); return null; }
    return data;
}

async function eliminarPrestamoAdmin(id) {
    if (!supabaseClientInstance) return;
    const { error } = await supabaseClientInstance.from('prestamos').delete().eq('id', id);
    if (error) console.error('DEBUG: admin_ops.js - Error eliminar prestamo:', error);
}

async function listarNotificacionesAdmin() {
    if (!supabaseClientInstance) return [];
    const { data, error } = await supabaseClientInstance.from('notificaciones').select('*').order('id', { ascending: true });
    if (error) { console.error('DEBUG: admin_ops.js - Error listar notificaciones:', error); return []; }
    return data || [];
}

async function crearNotificacionAdmin(notificacion) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('notificaciones').insert(notificacion).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error crear notificación:', error); return null; }
    return data;
}

async function editarNotificacionAdmin(id, campos) {
    if (!supabaseClientInstance) return null;
    const { data, error } = await supabaseClientInstance.from('notificaciones').update(campos).eq('id', id).select().single();
    if (error) { console.error('DEBUG: admin_ops.js - Error editar notificación:', error); return null; }
    return data;
}

async function eliminarNotificacionAdmin(id) {
    if (!supabaseClientInstance) return;
    const { error } = await supabaseClientInstance.from('notificaciones').delete().eq('id', id);
    if (error) console.error('DEBUG: admin_ops.js - Error eliminar notificación:', error);
}

window.listarLibrosAdmin = listarLibrosAdmin;
window.crearLibroAdmin = crearLibroAdmin;
window.editarLibroAdmin = editarLibroAdmin;
window.eliminarLibroAdmin = eliminarLibroAdmin;

window.listarUsuariosAdmin = listarUsuariosAdmin;
window.crearUsuarioAdmin = crearUsuarioAdmin;
window.editarUsuarioAdmin = editarUsuarioAdmin;
window.eliminarUsuarioAdmin = eliminarUsuarioAdmin;

window.listarSolicitudesAdmin = listarSolicitudesAdmin;
window.crearSolicitudAdmin = crearSolicitudAdmin;
window.editarSolicitudAdmin = editarSolicitudAdmin;
window.eliminarSolicitudAdmin = eliminarSolicitudAdmin;

window.listarPrestamosAdmin = listarPrestamosAdmin;
window.crearPrestamoAdmin = crearPrestamoAdmin;
window.editarPrestamoAdmin = editarPrestamoAdmin;
window.eliminarPrestamoAdmin = eliminarPrestamoAdmin;

window.listarNotificacionesAdmin = listarNotificacionesAdmin;
window.crearNotificacionAdmin = crearNotificacionAdmin;
window.editarNotificacionAdmin = editarNotificacionAdmin;
window.eliminarNotificacionAdmin = eliminarNotificacionAdmin;
