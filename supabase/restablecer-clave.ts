import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const out = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return out({ error: "Método no permitido." }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const quien = createClient(url, anon, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await quien.auth.getUser();
    if (!u?.user) return out({ error: "Inicia sesión de nuevo." }, 401);

    const admin = createClient(url, svc);
    const { data: yo } = await admin.from("perfiles").select("rol,estado").eq("id", u.user.id).maybeSingle();
    if (!yo || yo.rol !== "directora" || yo.estado !== "aprobado") return out({ error: "Solo la directora puede hacer esto." }, 403);

    const { id, password } = await req.json();
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return out({ error: "Docente no válido." }, 400);
    if (typeof password !== "string" || password.length < 6 || password.length > 72) return out({ error: "La contraseña debe tener entre 6 y 72 caracteres." }, 400);

    const { data: obj } = await admin.from("perfiles").select("rol").eq("id", id).maybeSingle();
    if (!obj) return out({ error: "No se encontró al docente." }, 404);
    if (obj.rol === "directora" && id !== u.user.id) return out({ error: "No se puede cambiar la contraseña de otra directora." }, 403);

    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return out({ error: "No se pudo cambiar la contraseña: " + error.message }, 400);
    return out({ ok: true });
  } catch (_e) {
    return out({ error: "Error inesperado. Inténtalo de nuevo." }, 500);
  }
});
