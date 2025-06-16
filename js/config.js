// js/config.js
console.log("DEBUG: config.js - Cargado.");

const X_SUPABASE_URL = 'https://srqdgsgxkxfiveynxkwt.supabase.co'; 
const X_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWRnc2d4a3hmaXZleW54a3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mjg2MjUsImV4cCI6MjA2NDEwNDYyNX0.xenXPUm17l0LvbvUk0fsbVik3y5uKP3ADwaVN5BcKGY';

const AVATARES_DISPONIBLES = [
    { id: 'avatar_robot', nombre: 'Robot', emoji: '🤖' }, { id: 'avatar_pelota', nombre: 'Pelota', emoji: '⚽️' },
    { id: 'avatar_perro', nombre: 'Perro', emoji: '🐶' }, { id: 'avatar_gato', nombre: 'Gato', emoji: '🐱' },
    { id: 'avatar_cohete', nombre: 'Cohete', emoji: '🚀' }, { id: 'avatar_mago', nombre: 'Mago', emoji: '🧙' },
    { id: 'avatar_unicornio', nombre: 'Unicornio', emoji: '🦄' }, { id: 'avatar_panda', nombre: 'Panda', emoji: '🐼' }
];

// Texto introductorio que se muestra antes de crear un usuario
const MENSAJE_INTRO_REGISTRO = `¡Hola! LibroVa es una app para que compartas libros con tus compañeros.<br>
Puedes prestar tus propios libros y pedir prestados los de los demás.<br>
Cada vez que devuelves un libro a tiempo tu reputación mejora y subes en el ranking.<br>
También puedes subir libros digitales para que otros los lean.<br>
Para entrar elige un avatar, un apodo y un PIN de 4 números.<br>
Si estás de acuerdo, presiona “Aceptar” y empieza a disfrutar de la lectura.`;
