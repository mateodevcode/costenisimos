import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { getSite } from "@/lib/config";

let transporter;

function getTransporter() {
  if (!transporter) {
    const { user, pass } = env.mail;
    transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    });
  }
  return transporter;
}

const escapar = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Plantilla HTML sobria con la marca del restaurante (site.nombre, site.logoUrl, APP_URL). */
function plantilla({ site, titulo, cuerpoHtml }) {
  const nombre = escapar(site.nombre || "");
  const appUrl = env.APP_URL;
  const color = /^#[0-9a-f]{6}$/i.test(site.colorPrimario || "") ? site.colorPrimario : "#111111";
  const logo = site.logoUrl
    ? `<img src="${escapar(site.logoUrl)}" alt="${nombre}" width="64" height="64" style="display:block;margin:0 auto 12px;border-radius:12px;object-fit:cover" />`
    : "";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapar(titulo)}</title></head>
<body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="padding:28px 28px 8px;text-align:center">
      ${logo}
      <div style="font-size:18px;font-weight:bold">${nombre}</div>
    </td></tr>
    <tr><td style="padding:8px 28px 28px">
      <h1 style="font-size:20px;margin:16px 0 12px;color:${color}">${escapar(titulo)}</h1>
      ${cuerpoHtml}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#fafaf9;font-size:12px;color:#78716c;text-align:center">
      <a href="${escapar(appUrl)}" style="color:#78716c">${escapar(appUrl.replace(/^https?:\/\//, ""))}</a>
    </td></tr>
  </table>
</body></html>`;
}

export async function enviarCorreo({ to, subject, titulo, cuerpoHtml, texto }) {
  const site = await getSite();
  const { fromName, fromAddress } = env.mail;
  await getTransporter().sendMail({
    from: { name: fromName || site.nombre || "", address: fromAddress },
    to,
    subject,
    text: texto,
    html: plantilla({ site, titulo, cuerpoHtml }),
  });
}

export async function enviarCodigoRecuperacion({ to, nombre, codigo }) {
  const site = await getSite();
  const cuerpoHtml = `
    <p style="margin:0 0 12px">Hola ${escapar(nombre || "")},</p>
    <p style="margin:0 0 16px">Recibimos una solicitud para restablecer tu contraseña. Usa este código:</p>
    <div style="font-size:32px;letter-spacing:8px;font-weight:bold;text-align:center;padding:16px;background:#f5f5f4;border-radius:12px">${escapar(codigo)}</div>
    <p style="margin:16px 0 0;font-size:14px;color:#57534e">El código vence en 10 minutos. Si no fuiste tú, ignora este correo: tu contraseña no cambiará.</p>`;
  await enviarCorreo({
    to,
    subject: `${site.nombre ? `${site.nombre}: ` : ""}código para restablecer tu contraseña`,
    titulo: "Restablecer contraseña",
    cuerpoHtml,
    texto: `Tu código para restablecer la contraseña es ${codigo}. Vence en 10 minutos. Si no fuiste tú, ignora este correo.`,
  });
}
