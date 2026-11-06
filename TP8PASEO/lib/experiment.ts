import { createHash } from "node:crypto";

export type Variant = "a" | "b";

export type Copy = {
  title: string;
  description: string;
  headline: string;
  cta: string;
};

/**
 * Los dos mensajes del experimento. La oferta NO vive acá: es compartida
 * para que las dos variantes vendan exactamente el mismo producto.
 */
export const COPY: Record<Variant, Copy> = {
  a: {
    title: "Cursos de oficio en ocho semanas, con salida laboral",
    description:
      "Aprendé carpintería, electricidad o cocina en ocho semanas. Grupos de doce personas y práctica real, con una salida laboral que se puede cobrar.",
    headline: "Ocho semanas para un oficio que se puede cobrar.",
    cta: "Ver cupos de abril",
  },
  b: {
    title: "Abril abre cupos: cursos de oficio en grupos de 12",
    description:
      "El 14 de abril empiezan grupos de doce. En la cohorte anterior, ocho de cada diez consiguieron trabajo en el rubro antes de los noventa días.",
    headline: "El curso empieza el 14 de abril. El cupo, no.",
    cta: "Reservar mi lugar",
  },
};

/** Oferta fija: idéntica en A y en B. */
export const OFERTA = {
  inicio: "14 de abril",
  duracion: "8 semanas",
  cupo: "12 personas",
  oficios: "Carpintería, electricidad y cocina",
} as const;

/** Caso de prueba fijo del instructivo. */
export const FIXED_CASE = {
  a: { impressions: 240, conversions: 18 },
  b: { impressions: 236, conversions: 31 },
} as const;

/**
 * Hash estable: SHA-256 del identificador del visitante. Se usa el primer
 * byte y su paridad: par -> A (control), impar -> B (tratamiento).
 * El mismo id devuelve siempre la misma variante.
 */
export function assignVariant(visitorId: string): Variant {
  const digest = createHash("sha256").update(visitorId).digest();
  return digest[0] % 2 === 0 ? "a" : "b";
}

export function isValidVisitor(value: string | undefined | null): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(value);
}

export function normalizePreview(value: string | string[] | undefined): Variant | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "a" || raw === "b" ? raw : null;
}

/** Conversiones / impresiones. Sin impresiones no hay tasa: devuelve null. */
export function rate(conversions: number, impressions: number): number | null {
  if (impressions <= 0) return null;
  return conversions / impressions;
}

/** 0.075 -> "7,50%" (coma decimal, dos decimales). */
export function formatRate(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(2).replace(".", ",")}%`;
}

/** 0.056355... -> "5,64 pp". */
export function formatPp(value: number): string {
  return `${(value * 100).toFixed(2).replace(".", ",")} pp`;
}
