// =====================================================
// supabase-client.js
// Cliente Supabase compartido entre todos los módulos.
// Exporta una única instancia para evitar reconexiones.
// =====================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Credenciales del proyecto ──────────────────────
const SUPABASE_URL = 'https://jqehwpfgrzbgixyscvcy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UszbWvU6PAHV7NC6Dn51og_NQoGpOJD';

// ── Instancia única (Singleton) ────────────────────
export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Nombres de tablas centralizados ───────────────
// Si cambias el nombre de una tabla en Supabase,
// solo lo cambias aquí y afecta a todo el proyecto.
export const TABLES = {
  CONTENIDO:   'contenido_global',  // clave, valor
  PAQUETES:    'paquetes',          // id, servicio, nombre, precio, caracteristicas[], activo
  PORTAFOLIO:  'portafolio',        // id, titulo, categoria, imagen_url, descripcion
  GALERIA:     'galeria',           // id, servicio, imagen_url
  PERFILES:    'perfiles',          // id, nombre, rol
};

// ── Buckets de Storage ─────────────────────────────
export const BUCKETS = {
  PORTAFOLIO: 'portafolio',
  GALERIA:    'galeria',
};

// ── Helper: obtener URL pública de un archivo ──────
export function getPublicUrl(bucket, path) {
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

// ── Helper: subir archivo y devolver URL pública ───
export async function uploadFile(bucket, path, file) {
  const { error } = await sb.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return getPublicUrl(bucket, path);
}