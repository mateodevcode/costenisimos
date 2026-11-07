// Seed idempotente: superadmin, configuración inicial e índices.
// Uso: npm run seed   (lee .env.local)

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Usuario from "../src/models/Usuario.js";
import Configuracion from "../src/models/Configuracion.js";
import Categoria from "../src/models/Categoria.js";
import Producto from "../src/models/Producto.js";
import Ingrediente from "../src/models/Ingrediente.js";
import RefreshToken from "../src/models/RefreshToken.js";
import Registro from "../src/models/Registro.js";
import RateLimit from "../src/models/RateLimit.js";
import Otp from "../src/models/Otp.js";
import { BCRYPT_ROUNDS, PASSWORD_MENSAJE, passwordValida } from "../src/lib/auth/password.js";
import { MENU_INFO_DEFAULT, SITE_DEFAULT } from "../src/lib/constants.js";

function requerido(nombre) {
  const v = process.env[nombre];
  if (!v || !v.trim()) {
    console.error(`✖ Falta la variable de entorno ${nombre}.`);
    process.exit(1);
  }
  return v.trim();
}

const MONGODB_URI = requerido("MONGODB_URI");
const EMAIL = requerido("SEED_SUPERADMIN_EMAIL").toLowerCase();
const PASSWORD = requerido("SEED_SUPERADMIN_PASSWORD");

if (!passwordValida(PASSWORD)) {
  console.error(`✖ SEED_SUPERADMIN_PASSWORD no cumple la política. ${PASSWORD_MENSAJE}`);
  process.exit(1);
}

// Valores de ejemplo neutros: se editan desde /master/configuracion.
const SITE_EJEMPLO = {
  ...SITE_DEFAULT,
  nombre: "Costeñisimos",
  slogan: "Cocina casera con sabor local",
  descripcion: "Carta digital del restaurante. Consulta nuestros platos, horarios y ubicación.",
  telefono: "+57 300 000 0000",
  email: "contacto@ejemplo.com",
  direccion: "Calle 1 # 2-3, Ciudad",
  mapsQuery: "Calle 1 # 2-3, Ciudad",
  whatsapp: [{ numero: "573000000000", mensaje: "Hola, quiero hacer una consulta." }],
  redes: { instagram: "", facebook: "", tiktok: "" },
  nosotros: {
    titulo: "Nosotros",
    parrafos: [
      "Somos un restaurante familiar dedicado a la cocina tradicional.",
      "Edita este texto desde el panel de configuración.",
    ],
    imagenes: [],
  },
  politicas: {
    // Razón social y NIT reales se completan desde el panel (si se dejan vacíos, la política usa el nombre).
    razonSocial: "",
    nit: "",
    correoContacto: "privacidad@ejemplo.com",
    textoExtra: "",
  },
};

const MENU_INFO_EJEMPLO = {
  ...MENU_INFO_DEFAULT,
  horarioCocina: "Lunes a domingo, 7:00 a. m. – 10:00 p. m.",
  menuDesayuno: "7:00 a. m. – 11:00 a. m.",
  menuDia: "11:00 a. m. – 5:00 p. m.",
  menuNoche: "5:00 p. m. – 10:00 p. m.",
  alergenos: "Consulta con nuestro personal si tienes alguna alergia o restricción alimentaria.",
};

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("✔ Conectado a MongoDB");

  for (const Modelo of [Usuario, Configuracion, Categoria, Producto, Ingrediente, RefreshToken, Registro, RateLimit, Otp]) {
    await Modelo.createIndexes();
  }
  console.log("✔ Índices sincronizados");

  const existente = await Usuario.findOne({ email: EMAIL });
  if (existente) {
    if (existente.role !== "superadmin") {
      existente.role = "superadmin";
      existente.bloqueado = false;
      await existente.save();
      console.log(`✔ ${EMAIL} existía y fue promovido a superadmin`);
    } else {
      console.log(`• El superadmin ${EMAIL} ya existe (sin cambios)`);
    }
  } else {
    await Usuario.create({
      name: "Superadmin",
      email: EMAIL,
      password: await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS),
      role: "superadmin",
    });
    console.log(`✔ Superadmin creado: ${EMAIL}`);
  }

  const iniciales = [
    ["home_theme", "a"],
    ["menu_theme", "a"],
    ["menu_info", MENU_INFO_EJEMPLO],
    ["site", SITE_EJEMPLO],
  ];
  for (const [key, value] of iniciales) {
    const r = await Configuracion.updateOne({ key }, { $setOnInsert: { key, value } }, { upsert: true });
    console.log(r.upsertedCount ? `✔ Configuración "${key}" creada` : `• Configuración "${key}" ya existía`);
  }

  await mongoose.disconnect();
  console.log("✔ Seed completado");
}

main().catch(async (err) => {
  console.error("✖ Error en el seed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
