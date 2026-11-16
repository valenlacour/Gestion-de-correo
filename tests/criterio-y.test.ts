import { CriterioY } from "../src/services/criterios/CriterioY";
import { CriterioCompuesto } from "../src/services/criterios/CriterioCompuesto";
import { CriterioFiltro } from "../src/services/criterios/CriterioFiltro";
import { CriterioSimple } from "../src/services/criterios/CriterioSimple";
import { asuntoContiene, leido, not, remitenteDeDominio } from "../src/services/predicados";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const profe = new Contacto("Prof. Gómez", "gomez@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const nuevo = (remitente: Contacto, asunto: string) =>
  new Correo({ remitente, asunto, destinatarios: [ana] });

const deLaUcp = new CriterioSimple("De la UCP", remitenteDeDominio("@ucp.edu.ar"));
const conExamen = new CriterioSimple("Asunto con Examen", asuntoContiene("Examen"));
const sinLeer = new CriterioSimple("Sin leer", not(leido));

describe("RF-05 · CriterioY (AND)", () => {
  it("es un CriterioCompuesto y un CriterioFiltro (herencia en dos niveles)", () => {
    const criterio = new CriterioY("Académicos", [deLaUcp, conExamen]);
    expect(criterio).toBeInstanceOf(CriterioCompuesto);
    expect(criterio).toBeInstanceOf(CriterioFiltro);
  });

  it("cumple solo si cumplen TODOS los filtros", () => {
    const academicos = new CriterioY("Correos académicos importantes", [deLaUcp, conExamen]);
    const a = nuevo(profe, "Examen final");
    const b = nuevo(profe, "Aviso");
    const c = nuevo(luis, "Examen final");
    expect(academicos.aplicar([a, b, c])).toEqual([a]);
  });

  it("acepta tres o más filtros", () => {
    const triple = new CriterioY("Triple", [deLaUcp, conExamen, sinLeer]);
    const yaLeido = nuevo(profe, "Examen");
    yaLeido.marcarComoLeido();
    const pendiente = nuevo(profe, "Examen");
    expect(triple.aplicar([yaLeido, pendiente])).toEqual([pendiente]);
  });

  it("puede combinar otros criterios compuestos", () => {
    const interno = new CriterioY("Interno", [deLaUcp, conExamen]);
    const externo = new CriterioY("Externo", [interno, sinLeer]);
    const yaLeido = nuevo(profe, "Examen");
    yaLeido.marcarComoLeido();
    const pendiente = nuevo(profe, "Examen");
    expect(externo.aplicar([yaLeido, pendiente])).toEqual([pendiente]);
  });

  it("refleja los cambios en los correos sin guardar nada", () => {
    const criterio = new CriterioY("Pendientes de la UCP", [deLaUcp, sinLeer]);
    const a = nuevo(profe, "Aviso");
    expect(criterio.aplicar([a])).toEqual([a]);
    a.marcarComoLeido();
    expect(criterio.aplicar([a])).toEqual([]);
  });
});
