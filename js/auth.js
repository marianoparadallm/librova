// js/auth.js
console.log("DEBUG: auth.js - Cargado.");

async function cerrarSesion() {
    // ... (Misma función cerrarSesion que tenías, usa supabaseClientInstance y currentUser globales)
    console.log("DEBUG: auth.js - Cerrando sesión...");
    if (currentUser && currentUser.rol === 'admin' && supabaseClientInstance) {
        const { error } = await supabaseClientInstance.auth.signOut();
        if (error) { console.error('DEBUG: auth.js - Error al cerrar sesión de admin:', error); /* No alert */ }
    }
    detenerMonitoreoNotificaciones();
    currentUser = null; localStorage.removeItem('libroVaUser');
    console.log('DEBUG: auth.js - Sesión cerrada localmente.');
    renderizarVistaBienvenida(); // Asume que renderizarVistaBienvenida es global
    actualizarMenuPrincipal(); // Asume que actualizarMenuPrincipal es global
}

async function loginAdmin(email, password) {
    // ... (Misma función loginAdmin que tenías)
    console.log("DEBUG: auth.js - Intentando login admin con email:", email);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; } // Mantener alert aquí o manejar error
    const { data, error } = await supabaseClientInstance.auth.signInWithPassword({ email, password });
    if (error) { console.error('DEBUG: auth.js - Error login Admin:', error.message); alert(`Error Admin: ${error.message}`); return null; }
    if (data.user) {
        console.log('DEBUG: auth.js - Admin logueado:', data.user);
        currentUser = { id: data.user.id, email: data.user.email, rol: 'admin', reputacion: 'N/A' }; // Actualiza currentUser global
        iniciarMonitoreoNotificaciones();
        return currentUser;
    }
    return null;
}

async function registrarAlumno(nickname, idAvatarSeleccionado, pin) {
    // ... (Misma función registrarAlumno que tenías)
    console.log("DEBUG: auth.js - Intentando registrar alumno con nickname:", nickname, "y avatar ID:", idAvatarSeleccionado);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const nicknameLimpio = nickname.trim();
    if (!nicknameLimpio || nicknameLimpio.length < 3) { alert('El Nickname debe tener al menos 3 caracteres.'); return null; }
    const avatarElegido = AVATARES_DISPONIBLES.find(a => a.id === idAvatarSeleccionado); // AVATARES_DISPONIBLES de config.js
    if (!avatarElegido) { alert('Avatar seleccionado no es válido.'); return null; }
    const nombreAvatarParaGuardar = avatarElegido.nombre;
    let { data: usuariosConEseNickname, error: errorNicknameUnico } = await supabaseClientInstance.from('usuarios').select('id').eq('nickname', nicknameLimpio).limit(1); 
    if (errorNicknameUnico) { console.error('DEBUG: auth.js - Error al verificar unicidad de nickname:', errorNicknameUnico); alert('Error al registrar. Intenta de nuevo.'); return null; }
    if (usuariosConEseNickname && usuariosConEseNickname.length > 0) { alert('Ese Nickname ya está en uso. Por favor, elige otro.'); return null; }
    const { data, error } = await supabaseClientInstance.from('usuarios').insert([{ nickname: nicknameLimpio, nombre_avatar: nombreAvatarParaGuardar, pin: pin, rol: 'alumno', reputacion: 0 }]).select().single();
    if (error) { console.error('DEBUG: auth.js - Error al registrar alumno:', error); alert(`Error al registrar: ${error.message}`); return null; }
    console.log('DEBUG: auth.js - Alumno registrado:', data);
    currentUser = data; localStorage.setItem('libroVaUser', JSON.stringify(currentUser));
    iniciarMonitoreoNotificaciones();
    return currentUser; // Actualiza currentUser global
}

async function loginAlumno(nombreAvatarSeleccionado, pin) {
    // ... (Misma función loginAlumno que tenías)
    console.log("DEBUG: auth.js - Intentando login alumno con nombre_avatar:", nombreAvatarSeleccionado);
    if (!supabaseClientInstance) { alert('Error: Supabase no está inicializado.'); return null; }
    const { data, error } = await supabaseClientInstance.from('usuarios').select('*').eq('nombre_avatar', nombreAvatarSeleccionado).eq('pin', pin).single(); 
    if (error) {
        if (error.code === 'PGRST116') { alert('Avatar o PIN incorrecto.'); } 
        else { console.error('DEBUG: auth.js - Error login Alumno:', error); alert('Error al iniciar sesión. Intenta de nuevo.'); }
        return null;
    }
    console.log('DEBUG: auth.js - Alumno logueado:', data);
    currentUser = data; localStorage.setItem('libroVaUser', JSON.stringify(currentUser));
    iniciarMonitoreoNotificaciones();
    return currentUser; // Actualiza currentUser global
}