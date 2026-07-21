// =====================================================
// auth.js
// Maneja: login, registro, logout, sesión activa
// y verificación de rol admin en tabla `perfiles`.
// Importado por index.html y admin.html.
// =====================================================

import { sb, TABLES } from './supabase-client.js';

// ── Estado global del usuario autenticado ─────────
let _currentUser  = null;
let _currentPerfil = null;

export function getCurrentUser()   { return _currentUser; }
export function getCurrentPerfil() { return _currentPerfil; }
export function isAdmin() { return _currentPerfil?.rol === 'admin'; }

// ── Iniciar sesión con email + contraseña ─────────
// Devuelve { user, perfil } o lanza Error.
export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Cargar perfil desde la tabla `perfiles`
  const perfil = await fetchPerfil(data.user.id);
  _currentUser   = data.user;
  _currentPerfil = perfil;
  return { user: data.user, perfil };
}

// ── Registrar nuevo usuario ────────────────────────
export async function signUp(email, password) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// ── Cerrar sesión ──────────────────────────────────
export async function signOut() {
  await sb.auth.signOut();
  _currentUser   = null;
  _currentPerfil = null;
}

// ── Obtener sesión activa al cargar la página ──────
// Retorna { user, perfil } o null si no hay sesión.
export async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;

  const perfil = await fetchPerfil(session.user.id);
  _currentUser   = session.user;
  _currentPerfil = perfil;
  return { user: session.user, perfil };
}

// ── Guardia para el panel admin ────────────────────
// Llama esto al inicio de admin.html.
// Si el usuario no está logueado o no es admin → redirige al home.
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'index.html';
    return false;
  }
  if (session.perfil?.rol !== 'admin') {
    alert('Acceso denegado. Se requiere rol de administrador.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ── Escuchar cambios de sesión en tiempo real ──────
// Callback recibe { event, user, perfil }
export function onAuthChange(callback) {
  sb.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const perfil = await fetchPerfil(session.user.id);
      _currentUser   = session.user;
      _currentPerfil = perfil;
      callback({ event, user: session.user, perfil });
    } else {
      _currentUser   = null;
      _currentPerfil = null;
      callback({ event, user: null, perfil: null });
    }
  });
}

// ── Privado: cargar perfil por user_id ─────────────
async function fetchPerfil(userId) {
  const { data, error } = await sb
    .from(TABLES.PERFILES)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) console.warn('fetchPerfil error:', error.message);
  return data ?? { nombre: 'Usuario', rol: 'user' };
}