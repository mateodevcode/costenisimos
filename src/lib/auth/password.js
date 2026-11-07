// Política de contraseña única, compartida por cliente y servidor (sin dependencias).

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export const PASSWORD_MENSAJE =
  "La contraseña debe tener al menos 10 caracteres e incluir mayúscula, minúscula, número y símbolo.";

export const BCRYPT_ROUNDS = 12;

export function passwordValida(password) {
  return typeof password === "string" && PASSWORD_REGEX.test(password);
}

/** Requisitos individuales, útiles para el medidor de fortaleza. */
export function requisitosPassword(password = "") {
  return [
    { id: "largo", texto: "Mínimo 10 caracteres", cumple: password.length >= 10 },
    { id: "minuscula", texto: "Una minúscula", cumple: /[a-z]/.test(password) },
    { id: "mayuscula", texto: "Una mayúscula", cumple: /[A-Z]/.test(password) },
    { id: "numero", texto: "Un número", cumple: /\d/.test(password) },
    { id: "simbolo", texto: "Un símbolo", cumple: /[^A-Za-z0-9]/.test(password) },
  ];
}

/** Puntaje 0-4 para el medidor de fortaleza. */
export function fortalezaPassword(password = "") {
  const cumplidos = requisitosPassword(password).filter((r) => r.cumple).length;
  let puntaje = Math.max(0, cumplidos - 1);
  if (puntaje === 4 && password.length < 14) puntaje = 3;
  if (cumplidos === 5) puntaje = Math.max(puntaje, 3);
  if (cumplidos === 5 && password.length >= 14) puntaje = 4;
  const etiquetas = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  return { puntaje, etiqueta: etiquetas[puntaje] };
}
