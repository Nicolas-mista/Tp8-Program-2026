import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import {
  COPY,
  OFERTA,
  normalizePreview,
  type Variant,
} from "@/lib/experiment";
import { reserve } from "./actions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function currentVariant(): Promise<Variant> {
  const requestHeaders = await headers();
  const fromProxy = requestHeaders.get("x-tn-variant");
  if (fromProxy === "a" || fromProxy === "b") return fromProxy;

  const cookieStore = await cookies();
  return cookieStore.get("tn_variant")?.value === "b" ? "b" : "a";
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const preview = normalizePreview(params.preview);
  const variant = preview ?? (await currentVariant());
  const copy = COPY[variant];

  return {
    // absolute: el title del crawler es el de la variante, sin sufijo del layout.
    title: { absolute: copy.title },
    description: copy.description,
    alternates: { canonical: "/practica" },
    robots: preview
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function PracticaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const preview = normalizePreview(params.preview);
  const variant = preview ?? (await currentVariant());
  const copy = COPY[variant];
  const reserved = !preview && params.gracias === "1";

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          Taller Norte
          <small>Escuela de oficios</small>
        </div>
        <nav>
          <a href="/practica">Landing</a>
          <a href="/bitacora">Bitácora</a>
        </nav>
      </header>

      {preview && (
        <p className="note">
          Vista previa de la variante <strong>{preview.toUpperCase()}</strong>.
          No escribe cookies, no cuenta impresiones y lleva <code>noindex</code>.
        </p>
      )}

      {reserved && (
        <p className="success">
          Listo: tu lugar quedó reservado. El curso empieza el 14 de abril.
        </p>
      )}

      <section className="hero">
        <p className="kicker">Cursos de oficio · Abril 2026</p>
        <h1>{copy.headline}</h1>
        <p className="lead">{copy.description}</p>

        {preview ? (
          <button type="button" className="cta cta-static">
            {copy.cta}
          </button>
        ) : (
          <form action={reserve}>
            <button type="submit" className="cta">
              {copy.cta}
            </button>
          </form>
        )}
      </section>

      <ul className="offer">
        <li>
          <strong>Inicio</strong>
          <span>{OFERTA.inicio}</span>
        </li>
        <li>
          <strong>Duración</strong>
          <span>{OFERTA.duracion}</span>
        </li>
        <li>
          <strong>Cupo</strong>
          <span>{OFERTA.cupo}</span>
        </li>
        <li>
          <strong>Oficios</strong>
          <span>{OFERTA.oficios}</span>
        </li>
      </ul>

      <p className="small">
        La oferta es idéntica en las dos variantes: cambia el mensaje, no el
        producto. Variante servida: <strong>{variant.toUpperCase()}</strong>
        {variant === "a" ? " (control)" : " (tratamiento)"}.
      </p>
    </main>
  );
}
