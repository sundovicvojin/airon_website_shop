import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Unesite mejl adresu.").max(254).pipe(z.email("Unesite ispravnu mejl adresu.")),
});

export const newPasswordSchema = z.object({
  confirmation: z.string(),
  // 72 is the bcrypt byte limit enforced by Supabase Auth.
  password: z.string().min(12, "Šifra mora imati najmanje 12 znakova.").max(72, "Šifra može imati najviše 72 znaka."),
}).refine((value) => value.password === value.confirmation, { message: "Šifre se ne poklapaju.", path: ["confirmation"] });
