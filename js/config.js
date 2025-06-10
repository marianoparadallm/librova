// js/config.js
console.log("DEBUG: config.js - Cargado.");

const SUPABASE_URL =
    (typeof window !== 'undefined' && window.SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env.SUPABASE_URL) ||
    '';
const SUPABASE_ANON_KEY =
    (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) ||
    '';

const AVATARES_DISPONIBLES = [ 
    { id: 'avatar_robot', nombre: 'Robot', emoji: '🤖' }, { id: 'avatar_pelota', nombre: 'Pelota', emoji: '⚽️' },
    { id: 'avatar_perro', nombre: 'Perro', emoji: '🐶' }, { id: 'avatar_gato', nombre: 'Gato', emoji: '🐱' },
    { id: 'avatar_cohete', nombre: 'Cohete', emoji: '🚀' }, { id: 'avatar_mago', nombre: 'Mago', emoji: '🧙' },
    { id: 'avatar_unicornio', nombre: 'Unicornio', emoji: '🦄' }, { id: 'avatar_panda', nombre: 'Panda', emoji: '🐼' }
];