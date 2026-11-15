import { CriterioSimple } from "../src/services/criterios/CriterioSimple";
import { CriterioFiltro } from "../src/services/criterios/CriterioFiltro";
import { RegistroFiltros } from "../src/services/filtros";
import { asuntoContiene, leido, not } from "../src/services/predicados";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

describe("RF-05 · CriterioSimple", () => {
  it("es un CriterioFiltro (herencia)", () => {
    expect(new CriterioSimple("Todos", () => true)).toBeInstanceOf(CriterioFiltro);
  });

  it("evalúa la expresión lambda que recibe", () => {
    const criterio = new CriterioSimple("Con examen", (c) => c.asunto.includes("Examen"));
    const a = nuevo("Examen");
    const b = nuevo("Otro");
    expect(criterio.aplicar([a, b])).toEqual([a]);
  });

  it("reutiliza los predicados que ya existen", () => {
    const a = nuevo("Examen");
    const b = nuevo("Otro");
    b.marcarComoLeido();
    expect(new CriterioSimple("Examen", asuntoContiene("examen")).aplicar([a, b])).toEqual([a]);
    expect(new CriterioSimple("Sin leer", not(leido)).aplicar([a, b])).toEqual([a]);
  });

  it("no guarda correos: los resultados siguen el estado actual", () => {
    const criterio = new CriterioSimple("Sin leer", not(leido));
    const a = nuevo("A");
    const b = nuevo("B");
    expect(criterio.aplicar([a, b])).toEqual([a, b]);
    a.marcarComoLeido();
    expect(criterio.aplicar([a, b])).toEqual([b]);
  });

  it("el mismo criterio se puede aplicar a colecciones distintas", () => {
    const criterio = new CriterioSimple("Examen", asuntoContiene("examen"));
    const uno = nuevo("Examen 1");
    const dos = nuevo("Examen 2");
    expect(criterio.aplicar([uno])).toEqual([uno]);
    expect(criterio.aplicar([dos])).toEqual([dos]);
  });

  it("se puede registrar en el RegistroFiltros usando su nombre y su predicado", () => {
    const criterio = new CriterioSimple("Examen", asuntoContiene("examen"));
    const registro = new RegistroFiltros();
    registro.registrar(criterio.nombre, criterio.predicado);
    const a = nuevo("Examen");
    const b = nuevo("Otro");
    expect(registro.aplicar("Examen", [a, b])).toEqual([a]);
  });
});
