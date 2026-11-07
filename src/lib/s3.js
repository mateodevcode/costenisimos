import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let client;

function getClient() {
  if (!client) {
    const { region, accessKeyId, secretAccessKey } = env.storage;
    client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  }
  return client;
}

/** Sube un objeto y devuelve { url, key }. */
export async function subirObjeto({ key, body, contentType }) {
  const { bucket, publicUrl } = env.storage;
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return { url: `${publicUrl}/${key}`, key };
}

export async function eliminarObjeto(key) {
  const { bucket } = env.storage;
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Si la URL pertenece a nuestro bucket, devuelve su key; si no, null. */
export function keyDesdeUrl(url) {
  if (typeof url !== "string" || !url) return null;
  const { publicUrl } = env.storage;
  return url.startsWith(`${publicUrl}/`) ? url.slice(publicUrl.length + 1) : null;
}
