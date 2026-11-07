import "server-only";
import { connectDB } from "@/lib/db";
import Registro from "@/models/Registro";

const IGNORAR = new Set(["_id", "__v", "createdAt", "updatedAt", "password", "codigoHash"]);

/** Convierte un documento (o valor) a JSON plano sin campos sensibles. */
function plano(valor) {
  if (valor === undefined || valor === null) return null;
  const json = JSON.parse(JSON.stringify(typeof valor?.toObject === "function" ? valor.toObject() : valor));
  if (json && typeof json === "object" && !Array.isArray(json)) {
    delete json.password;
    delete json.__v;
  }
  return json;
}

function igual(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/** Diferencias campo a campo (primer nivel). */
export function calcularCambios(antes, despues) {
  const a = antes && typeof antes === "object" && !Array.isArray(antes) ? antes : {};
  const d = despues && typeof despues === "object" && !Array.isArray(despues) ? despues : {};
  if (!antes || !despues || typeof antes !== "object" || typeof despues !== "object") {
    if (!antes || !despues) return [];
    return igual(antes, despues) ? [] : [{ campo: "valor", antes, despues }];
  }
  const campos = new Set([...Object.keys(a), ...Object.keys(d)]);
  const cambios = [];
  for (const campo of campos) {
    if (IGNORAR.has(campo)) continue;
    if (!igual(a[campo], d[campo])) cambios.push({ campo, antes: a[campo] ?? null, despues: d[campo] ?? null });
  }
  return cambios;
}

function nombreDe(obj) {
  if (!obj || typeof obj !== "object") return "";
  return obj.nombre || obj.name || obj.key || obj.email || "";
}

/**
 * Registra una acción en la bitácora. Nunca lanza: si falla, solo loguea.
 * @param {{ sesion, accion, entidad, antes?, despues?, entidadId?, entidadNombre? }} p
 */
export async function registrar({ sesion, accion, entidad, antes, despues, entidadId, entidadNombre }) {
  try {
    await connectDB();
    const a = plano(antes);
    const d = plano(despues);
    const ref = d || a || {};
    await Registro.create({
      usuario: sesion
        ? { id: String(sesion.id), name: sesion.name || "", email: sesion.email || "", role: sesion.role || "" }
        : undefined,
      accion,
      entidad,
      entidadId: entidadId ?? (ref._id || ref.id ? String(ref._id || ref.id) : undefined),
      entidadNombre: entidadNombre ?? nombreDe(ref),
      datosAntes: a,
      datosDespues: d,
      cambios: calcularCambios(a, d),
      fecha: new Date(),
    });
  } catch (err) {
    console.error("[registro] No se pudo guardar en la bitácora:", err);
  }
}
