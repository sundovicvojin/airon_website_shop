import "server-only";

import { z } from "zod";

const imageMime = z.enum(["image/avif", "image/webp", "image/png", "image/jpeg"]);

export async function validateImage(file: File) {
  if (file.size < 1 || file.size > 8 * 1024 * 1024) throw new Error("Image must be between 1 byte and 8 MB.");
  const mime = imageMime.parse(file.type);
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = new TextDecoder().decode(bytes);
  const valid = mime === "image/png" ? bytes[0] === 0x89 && ascii.slice(1,4) === "PNG"
    : mime === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : mime === "image/webp" ? ascii.startsWith("RIFF") && ascii.slice(8,12) === "WEBP"
    : ascii.slice(4,12).includes("ftypavif") || ascii.slice(4,12).includes("ftypavis");
  if (!valid) throw new Error("Image signature does not match its MIME type.");
  return { extension: mime === "image/jpeg" ? "jpg" : mime.split("/")[1], mime };
}

export async function validatePdf(file: File) {
  if (file.size < 5 || file.size > 15 * 1024 * 1024) throw new Error("PDF must be between 5 bytes and 15 MB.");
  if (file.type !== "application/pdf") throw new Error("Only PDF documents are accepted.");
  const signature = new TextDecoder().decode(new Uint8Array(await file.slice(0, 5).arrayBuffer()));
  if (signature !== "%PDF-") throw new Error("The uploaded file is not a valid PDF.");
}
