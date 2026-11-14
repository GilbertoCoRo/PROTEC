/* PROTEC — configuración única de Supabase.
   Esta es la clave PÚBLICA (anon): el navegador siempre puede verla, es así por diseño.
   La protección real de los datos la dan las políticas RLS de Supabase, no este archivo.
   NUNCA pongas aquí la clave service_role. */
(function () {
  'use strict';
  var CONFIG = {
    url: 'https://jqehwpfgrzbgixyscvcy.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZWh3cGZncnpiZ2l4eXNjdmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzQ2MzYsImV4cCI6MjA5MzU1MDYzNn0.u_ar9zJobhU8XSaghoLjo5x1PG6ms0rH70ldae1Xkx4'
  };
  window.PROTEC_CONFIG = CONFIG;
  if (!window.supabase) return;   // páginas sin SDK solo necesitan PROTEC_CONFIG
  window.supabaseClient = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
})();
