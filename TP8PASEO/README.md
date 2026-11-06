# TP8 — Taller Norte: una landing, dos mensajes, una sola URL indexable

Experimento A/B local con Next.js 16, TypeScript y SQLite (`node:sqlite`).

## Requisitos

- Node.js 24 o superior (usa el módulo incorporado `node:sqlite`).
- No hace falta ninguna base externa.

## Cómo correrlo

```bash
npm install
npm run dev
```

- Landing: <http://localhost:3000/practica>
- Bitácora: <http://localhost:3000/bitacora>

La raíz `/` redirige a `/practica`.

## Cómo funciona

| Archivo | Responsabilidad |
|---|---|
| `proxy.ts` | Asigna visitante y variante en el primer request, setea cookies y anota la impresión. |
| `lib/experiment.ts` | Copy A/B, oferta compartida, hash estable, caso fijo y formato de tasas. |
| `lib/db.ts` | SQLite: tabla `events`, impresión deduplicada y conversión única. |
| `app/practica/page.tsx` | Landing y metadatos generados en el servidor. |
| `app/practica/actions.ts` | Conversión disparada únicamente por el CTA. |
| `app/bitacora/page.tsx` | Conteos reales y caso de prueba fijo. |

- **Asignación:** SHA-256 del identificador del visitante; se usa el primer byte y su paridad (par = A, impar = B). El identificador se guarda en la cookie `tn_visitor` y la variante en `tn_variant`, ambas `httpOnly`, `path=/` y 30 días.
- **Impresión:** una por visitante cada 30 minutos.
- **Conversión:** una por visitante, solo desde el botón del CTA.
- **Preview:** `?preview=a` y `?preview=b` muestran la pieza sin escribir cookies, sin contar impresiones y con `noindex`.
- **Crawler:** recibe siempre el control A, en la misma URL y con el mismo canonical.
- **Canonical:** siempre `/practica`, sin query.
- **Base:** `data/experiment.db` (se crea sola y está en `.gitignore`).

## Prueba del hash

```bash
npm run hash-demo
```

Resultado esperado: `lab-visitor-demo-01` cae en **A** y se repite igual en las cinco ejecuciones.

## Verificación rápida

1. Recargar `/practica`: la variante no cambia.
2. Borrar cookies y volver: aparece otro visitante (puede tocar la otra variante).
3. Abrir `?preview=b`: se ve B, con `noindex`, canonical limpio y sin cookie nueva.
4. Recargar dentro de 30 minutos: no suma otra impresión.
5. Hacer clic en el CTA: suma una conversión; el segundo clic no suma otra.
6. Abrir `/bitacora`: el caso fijo muestra 7,50%, 13,14% y 5,64 pp.

## Reiniciar los eventos

Detener el servidor y borrar `data/experiment.db` (y sus archivos `-wal` / `-shm`). Se recrea al arrancar.

## Captura de la bitácora

La captura anotada del caso de prueba está en `capturas/caso-fijo-anotado.png`. La captura sin anotar está en `capturas/bitacora.png` y `capturas/anotado.html` permite regenerar la versión con el margen.

## Nota

El proyecto está pensado para correr en local sobre HTTP. Por eso las cookies usan `SameSite=Lax` y no `Secure`. No se usa `localStorage` en ningún momento.
