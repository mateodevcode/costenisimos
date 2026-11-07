import "server-only";

// Validación de variables de entorno. Se valida de forma perezosa (al usarse) para que
// `next build` no exija secretos de producción, pero con mensajes claros si faltan.

const GRUPOS = {
  core: ["MONGODB_URI", "APP_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"],
  google: ["GOOGLE_CLIENT_ID"],
  storage: ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_BUCKET", "AWS_S3_PUBLIC_URL"],
  mail: ["BREVO_SMTP_EMAIL", "BREVO_SMTP_PASS", "MAIL_FROM_ADDRESS"],
};

const validados = new Set();

function requerir(grupo) {
  if (validados.has(grupo)) return;
  const faltan = GRUPOS[grupo].filter((k) => !process.env[k] || !String(process.env[k]).trim());
  if (faltan.length) {
    throw new Error(
      `[env] Faltan variables de entorno (${grupo}): ${faltan.join(", ")}. Revisa .env.local (ver .env.example).`
    );
  }
  if (grupo === "core") {
    for (const k of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
      if (process.env[k].length < 32) {
        throw new Error(`[env] ${k} debe tener al menos 32 caracteres.`);
      }
    }
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      throw new Error("[env] JWT_SECRET y JWT_REFRESH_SECRET deben ser distintos.");
    }
  }
  validados.add(grupo);
}

export const env = {
  get MONGODB_URI() {
    requerir("core");
    return process.env.MONGODB_URI;
  },
  get APP_URL() {
    requerir("core");
    return process.env.APP_URL.replace(/\/+$/, "");
  },
  get JWT_SECRET() {
    requerir("core");
    return process.env.JWT_SECRET;
  },
  get JWT_REFRESH_SECRET() {
    requerir("core");
    return process.env.JWT_REFRESH_SECRET;
  },
  get GOOGLE_CLIENT_ID() {
    requerir("google");
    return process.env.GOOGLE_CLIENT_ID;
  },
  get storage() {
    requerir("storage");
    return {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET,
      carpeta: (process.env.AWS_S3_FOLDER || "carta").replace(/^\/+|\/+$/g, ""),
      publicUrl: process.env.AWS_S3_PUBLIC_URL.replace(/\/+$/, ""),
    };
  },
  get mail() {
    requerir("mail");
    return {
      user: process.env.BREVO_SMTP_EMAIL,
      pass: process.env.BREVO_SMTP_PASS,
      fromName: process.env.MAIL_FROM_NAME || "",
      fromAddress: process.env.MAIL_FROM_ADDRESS,
    };
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};
