import {
  FIXED_CASE,
  formatPp,
  formatRate,
  rate,
} from "@/lib/experiment";
import { getCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function BitacoraPage() {
  const counts = getCounts();

  const real = (["a", "b"] as const).map((variant) => {
    const row = counts[variant];
    const value = rate(row.conversions, row.impressions);
    return {
      variant,
      label: variant === "a" ? "A — Control" : "B — Tratamiento",
      impressions: row.impressions,
      conversions: row.conversions,
      rate: formatRate(value),
    };
  });

  const fixedA = rate(FIXED_CASE.a.conversions, FIXED_CASE.a.impressions) ?? 0;
  const fixedB = rate(FIXED_CASE.b.conversions, FIXED_CASE.b.impressions) ?? 0;
  const difference = fixedB - fixedA;

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

      <h1>Bitácora del experimento</h1>
      <p className="lead">
        Impresiones, conversiones y tasa por variante. La tasa es
        conversiones divididas por impresiones; sin impresiones no existe.
      </p>

      <h2>Eventos registrados</h2>
      <table>
        <thead>
          <tr>
            <th>Variante</th>
            <th>Impresiones</th>
            <th>Conversiones</th>
            <th>Tasa</th>
          </tr>
        </thead>
        <tbody>
          {real.map((row) => (
            <tr key={row.variant}>
              <td>{row.label}</td>
              <td className="num">{row.impressions}</td>
              <td className="num">{row.conversions}</td>
              <td className="num">{row.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small">
        Los eventos se guardan en <code>data/experiment.db</code>. Una
        impresión por sesión de 30 minutos y una conversión por visitante.
      </p>

      <h2>Caso de prueba fijo</h2>
      <table>
        <thead>
          <tr>
            <th>Variante</th>
            <th>Impresiones</th>
            <th>Conversiones</th>
            <th>Tasa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A — Control</td>
            <td className="num">{FIXED_CASE.a.impressions}</td>
            <td className="num">{FIXED_CASE.a.conversions}</td>
            <td className="num">{formatRate(fixedA)}</td>
          </tr>
          <tr>
            <td>B — Tratamiento</td>
            <td className="num">{FIXED_CASE.b.impressions}</td>
            <td className="num">{FIXED_CASE.b.conversions}</td>
            <td className="num">{formatRate(fixedB)}</td>
          </tr>
          <tr>
            <td>B − A</td>
            <td className="num">No se compara</td>
            <td className="num">No se compara</td>
            <td className="num">{formatPp(difference)}</td>
          </tr>
        </tbody>
      </table>

      <p className="note">
        {FIXED_CASE.a.conversions} / {FIXED_CASE.a.impressions} ={" "}
        {formatRate(fixedA)}. {FIXED_CASE.b.conversions} /{" "}
        {FIXED_CASE.b.impressions} = {formatRate(fixedB)}. La diferencia es{" "}
        {formatPp(difference)}. Es una diferencia observada, no una prueba:
        no se declara ganador.
      </p>
    </main>
  );
}
