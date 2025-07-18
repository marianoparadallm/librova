// js/calendar.js
// Simple weekly calendar using FullCalendar and Supabase

let supabaseCalendarClient = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof window.supabase !== 'undefined') {
    supabaseCalendarClient = window.supabase.createClient(X_SUPABASE_URL, X_SUPABASE_ANON_KEY);
  }
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ 'interaction', 'dayGrid', 'timeGrid' ],
    initialView: 'timeGridWeek',
    locale: 'es',
    selectable: true,
    editable: true,

    navLinks: true,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    dayHeaderContent: (arg) => {

      const names = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const dayName = names[arg.date.getDay()];
      const dayNum = new Intl.DateTimeFormat('es', {
        day: 'numeric',
        month: 'numeric'
      }).format(arg.date);
      return { html: `${dayName} ${dayNum}` };

    },

    select: async (info) => {
      const title = prompt('Título del evento:');
      if (title && supabaseCalendarClient) {
        const { data, error } = await supabaseCalendarClient
          .from('eventos')
          .insert({ titulo: title, inicio: info.startStr, fin: info.endStr })
          .select()
          .single();
        if (!error && data) {
          calendar.addEvent({ id: data.id, title, start: info.startStr, end: info.endStr });
        }
      }
      calendar.unselect();
    },
    eventDrop: async (info) => {
      if (supabaseCalendarClient) {
        const { error } = await supabaseCalendarClient
          .from('eventos')
          .update({ inicio: info.event.start.toISOString(), fin: info.event.end.toISOString() })
          .eq('id', info.event.id);
        if (error) info.revert();
      }
    },
    eventResize: async (info) => {
      if (supabaseCalendarClient) {
        const { error } = await supabaseCalendarClient
          .from('eventos')
          .update({ inicio: info.event.start.toISOString(), fin: info.event.end.toISOString() })
          .eq('id', info.event.id);
        if (error) info.revert();
      }
    },
    eventClick: async (info) => {
      if (confirm('¿Eliminar evento?') && supabaseCalendarClient) {
        const { error } = await supabaseCalendarClient
          .from('eventos')
          .delete()
          .eq('id', info.event.id);
        if (!error) info.event.remove();
      }
    }
  });

  if (supabaseCalendarClient) {
    const { data: events } = await supabaseCalendarClient
      .from('eventos')
      .select('id, titulo, inicio, fin');
    if (events) {
      events.forEach(ev => {
        calendar.addEvent({
          id: ev.id,
          title: ev.titulo,
          start: ev.inicio,
          end: ev.fin
        });
      });
    }
  }
  calendar.render();
});
