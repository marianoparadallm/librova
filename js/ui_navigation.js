// js/ui_navigation.js
console.log("DEBUG: ui_navigation.js - Cargado.");

function togglePopupNotificaciones() {
    const popup = document.getElementById('popup-notificaciones');
    if (!popup) return;
    if (popupNotificacionesVisible) {
        popup.style.display = 'none';
        popupNotificacionesVisible = false;
    } else {
        refrescarNotificaciones().then(() => {
            renderizarListaNotificaciones('popup-notificaciones', notificaciones);
            popup.style.display = 'block';
            popupNotificacionesVisible = true;
        });
    }
}

function ocultarPopupNotificaciones() {
    const popup = document.getElementById('popup-notificaciones');
    if (!popup) return;
    popup.style.display = 'none';
    popupNotificacionesVisible = false;
}

document.addEventListener('click', (e) => {
    const popup = document.getElementById('popup-notificaciones');
    if (!popup) return;
    if (popupNotificacionesVisible && !popup.contains(e.target) && e.target.id !== 'btn-notificaciones') {
        ocultarPopupNotificaciones();
    }
});

window.togglePopupNotificaciones = togglePopupNotificaciones;

function toggleHamburgerMenu() {
    const nav = document.getElementById('menu-principal');
    if (!nav) return;
    nav.classList.toggle('mobile-open');
}

// Asignar listener al botón de menú hamburguesa si existe
const hbBtn = document.getElementById('hamburger-btn');
if (hbBtn) hbBtn.addEventListener('click', toggleHamburgerMenu);

function cambiarVista(idVistaActual, idVistaNueva) {
    // ... (Misma función cambiarVista que tenías en tu app.js funcional)
    console.log(`DEBUG: ui_navigation.js - Intentando cambiar de vista: ${idVistaActual || 'ninguna'} a ${idVistaNueva}`);
    if (idVistaActual) {
        const vistaActualDOM = document.getElementById(idVistaActual);
        if (vistaActualDOM) { vistaActualDOM.classList.remove('activa'); vistaActualDOM.style.display = 'none'; }
    }
    document.querySelectorAll('.vista').forEach(vista => {
        if (vista.id !== idVistaNueva) { vista.style.display = 'none'; vista.classList.remove('activa');}
    });
    const vistaNuevaDOM = document.getElementById(idVistaNueva);
    if (vistaNuevaDOM) {
        vistaNuevaDOM.style.display = 'block'; vistaNuevaDOM.classList.add('activa'); 
        console.log(`DEBUG: ui_navigation.js - Vista activa establecida: ${idVistaNueva}`);
    } else {
        console.error(`DEBUG: ui_navigation.js - Vista nueva con ID '${idVistaNueva}' no encontrada.`);
        if(contenedorPrincipal) contenedorPrincipal.innerHTML = `<p>Error: Vista ${idVistaNueva} no encontrada.</p>`;
    }
}

function actualizarMenuPrincipal() {
    // ... (Misma función actualizarMenuPrincipal que tenías, usa la variable global currentUser)
    console.log("DEBUG: ui_navigation.js - Actualizando menú principal. Usuario actual:", currentUser);
    if (!menuPrincipal) { console.error("DEBUG: ui_navigation.js - Elemento menuPrincipal no encontrado."); return; }
    menuPrincipal.innerHTML = ''; 
    if (currentUser) {
        const nombreMostrar = currentUser.rol === 'admin' ? 'Admin' : currentUser.nickname; 
        const infoUsuario = document.createElement('span');
        const reputacionMostrar = (currentUser.reputacion !== undefined && currentUser.reputacion !== null) ? currentUser.reputacion : 0;
        infoUsuario.textContent = `Hola, ${nombreMostrar}! (Rep: ${reputacionMostrar}) `;
        // infoUsuario.style.marginRight = '20px'; // El estilo se maneja en CSS
        menuPrincipal.appendChild(infoUsuario);
        const btnDashboard = document.createElement('button');
        btnDashboard.textContent = 'Dashboard';
        btnDashboard.onclick = () => renderizarDashboard(); // Asume que renderizarDashboard es global
        menuPrincipal.appendChild(btnDashboard);

        const btnBuscarLibros = document.createElement('button');
        btnBuscarLibros.textContent = 'Buscar Libros';
        btnBuscarLibros.onclick = () => {
            const vistaActiva = document.querySelector('.vista.activa');
            cambiarVista(vistaActiva ? vistaActiva.id : null, 'vista-buscar-libros');
            cargarYMostrarLibros();
        };
        menuPrincipal.appendChild(btnBuscarLibros);

        const btnRanking = document.createElement('button');
        btnRanking.textContent = 'Ranking';
        btnRanking.onclick = () => {
            renderizarVistaRanking();
        };
        menuPrincipal.appendChild(btnRanking);

        if (currentUser.rol === 'admin') {
            const btnPanelAdmin = document.createElement('button');
            btnPanelAdmin.textContent = 'Panel Admin';
            btnPanelAdmin.onclick = () => {
                const vistaActiva = document.querySelector('.vista.activa');
                cambiarVista(vistaActiva ? vistaActiva.id : null, 'vista-admin-panel');
            };
            menuPrincipal.appendChild(btnPanelAdmin);
        }
        const btnNotificaciones = document.createElement('button');
        btnNotificaciones.id = 'btn-notificaciones';
        btnNotificaciones.textContent = '🔔';
        if (notificacionesNuevas > 0) {
            const badge = document.createElement('span');
            badge.className = 'contador-notificaciones';
            badge.textContent = notificacionesNuevas;
            btnNotificaciones.appendChild(badge);
        }
        btnNotificaciones.onclick = togglePopupNotificaciones;
        menuPrincipal.appendChild(btnNotificaciones);
        const btnCerrarSesion = document.createElement('button');
        btnCerrarSesion.textContent = 'Cerrar Sesión';
        btnCerrarSesion.onclick = cerrarSesion; // Asume que cerrarSesion es global
        menuPrincipal.appendChild(btnCerrarSesion);
    }
}