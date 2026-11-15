import { CriterioO } from "../src/services/criterios/CriterioO";
import { CriterioY } from "../src/services/criterios/CriterioY";
import { CriterioCompuesto } from "../src/services/criterios/CriterioCompuesto";
import { CriterioSimple } from "../src/services/criterios/CriterioSimple";
import { asuntoContiene, favorito } from "../src/services/predicados";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

const proyecto = new CriterioSimple("Asunto con Proyecto", asuntoContiene("Proyecto"));
const reunion = new CriterioSimple("Asunto con Reunión", asuntoContiene("Reunión"));

describe("RF-05 · CriterioO (OR)", () => {
  it("es un CriterioCompuesto (herencia)", () => {
    expect(new CriterioO("Proyecto o Reunión", [proyecto, reunion])).toBeInstanceOf(CriterioCompuesto);
  });

  it("cumple si cumple AL MENOS UNO de los filtros", () => {
    const criterio = new CriterioO("Proyecto o Reunión", [proyecto, reunion]);
    const a = nuevo("Proyecto final");
    const b = nuevo("Reunión de equipo");
    const c = nuevo("Fotos");
    expect(criterio.aplicar([a, b, c])).toEqual([a, b]);
  });

  it("no cumple si no cumple ninguno", () => {
    const criterio = new CriterioO("Proyecto o Reunión", [proyecto, reunion]);
    expect(criterio.aplicar([nuevo("Fotos")])).toEqual([]);
  });

  it("un correo que cumple varios filtros aparece una sola vez", () => {
    const criterio = new CriterioO("Proyecto o Reunión", [proyecto, reunion]);
    expect(criterio.aplicar([nuevo("Proyecto: reunión de entrega")])).toHaveLength(1);
  });

  it("puede combinar otros criterios compuestos", () => {
    const favoritoDelProyecto = new CriterioY("Favorito del proyecto", [
      new CriterioSimple("Favorito", favorito),
      proyecto,
    ]);
    const criterio = new CriterioO("Reunión o favorito del proyecto", [reunion, favoritoDelProyecto]);
    const a = nuevo("Proyecto");
    a.marcarComoFavorito();
    const b = nuevo("Proyecto");
    const c = nuevo("Reunión");
    expect(criterio.aplicar([a, b, c])).toEqual([a, c]);
  });
});
