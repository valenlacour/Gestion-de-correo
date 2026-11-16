import { CriterioNo } from "../src/services/criterios/CriterioNo";
import { CriterioY } from "../src/services/criterios/CriterioY";
import { CriterioO } from "../src/services/criterios/CriterioO";
import { CriterioFiltro } from "../src/services/criterios/CriterioFiltro";
import { CriterioSimple } from "../src/services/criterios/CriterioSimple";
import { Filtro } from "../src/services/filtros";
import { asuntoContiene, leido } from "../src/services/predicados";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

const yaLeido = new CriterioSimple("Leído", leido);

describe("RF-05 · CriterioNo (NOT)", () => {
  it("es un CriterioFiltro (herencia)", () => {
    expect(new CriterioNo("Sin leer", yaLeido)).toBeInstanceOf(CriterioFiltro);
  });

  it("cumple cuando el filtro NO se cumple", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    b.marcarComoLeido();
    expect(new CriterioNo("Sin leer", yaLeido).aplicar([a, b])).toEqual([a]);
  });

  it("negar dos veces devuelve el criterio original", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    b.marcarComoLeido();
    const doble = new CriterioNo("Doble negación", new CriterioNo("Sin leer", yaLeido));
    expect(doble.aplicar([a, b])).toEqual([b]);
  });

  it("acepta cualquier objeto que cumpla la interfaz Filtro, no solo criterios", () => {
    const siempre: Filtro = { nombre: "Siempre", predicado: () => true };
    expect(new CriterioNo("Nunca", siempre).aplicar([nuevo("A")])).toEqual([]);
  });

  it("combinado con AND y OR permite excluir correos (correos para seguimiento)", () => {
    const seguimiento = new CriterioY("Correos para seguimiento", [
      new CriterioO("Proyecto o Reunión", [
        new CriterioSimple("Asunto con Proyecto", asuntoContiene("Proyecto")),
        new CriterioSimple("Asunto con Reunión", asuntoContiene("Reunión")),
      ]),
      new CriterioNo("Excluir leídos", yaLeido),
    ]);
    const a = nuevo("Proyecto final");
    const b = nuevo("Reunión de equipo");
    b.marcarComoLeido();
    const c = nuevo("Fotos");
    expect(seguimiento.aplicar([a, b, c])).toEqual([a]);
  });
});
