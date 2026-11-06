# Informe — TP8 Taller Norte

## 1. Qué ve una persona asignada a B

Ve el titular **“El curso empieza el 14 de abril. El cupo, no.”** y el llamado a la acción **“Reservar mi lugar”**. El `title` es **“Abril abre cupos: cursos de oficio en grupos de 12”** (50 caracteres) y la `description` es **“El 14 de abril empiezan grupos de doce. En la cohorte anterior, ocho de cada diez consiguieron trabajo en el rubro antes de los noventa días.”** (141 caracteres).

No cambia la oferta: inicio el 14 de abril, duración de 8 semanas, cupo de 12 personas y los mismos oficios (carpintería, electricidad y cocina). Cambia el mensaje, no el producto.

## 2. Qué debería ver un crawler

Debería ver siempre la variante de control A, en la misma URL `/practica` y con el mismo canonical. Un crawler normalmente no conserva cookies; si cada visita sin cookie sorteara un mensaje, el buscador podría indexar un texto inestable. En este proyecto el `proxy` detecta el user-agent de crawler y le sirve A sin asignarle cookies ni registrar impresiones. No es cloaking: se mantiene la misma URL, el mismo canonical y el mismo contenido de la oferta; solo se fija una de las dos piezas reales del experimento.

## 3. Por qué el canonical no cambia

Porque las dos variantes son la misma página. El canonical es siempre `/practica`, sin query. Si se publicaran `/variante-a` y `/variante-b`, o se canonizara `?variant=b`, se fabricarían dos URLs con contenido casi idéntico y la indexación se repartiría entre ambas. El preview (`?preview=a|b`) es solo un instrumento de revisión: no asigna variante, no escribe cookies y lleva `noindex`.

## Cierre

La asignación usa **SHA-256 del identificador del visitante** y la paridad de su primer byte (par = A, impar = B). Con `lab-visitor-demo-01` el resultado es **A** y se repite igual en todas las ejecuciones (`npm run hash-demo`). Una tasa más alta no se interpreta como ganador: la diferencia de 5,64 pp es una diferencia observada, no una prueba.
