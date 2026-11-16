import { CriterioFiltro } from "../src/services/criterios/CriterioFiltro";
import { Filtro } from "../src/services/filtros";
import { Predicado } from "../src/services/predicados";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

class CriterioPorAsunto extends CriterioFiltro {
  constructor(nombre: string, private readonly texto: string) {
    super(nombre);
  }

  get predicado(): Predicado {
    return (correo) => correo.asunto.includes(this.texto);
  }
}

describe("RF-05 · clase abstracta CriterioFiltro", () => {
  it("guarda el nombre que identifica al criterio", () => {
    expect(new CriterioPorAsunto("Exámenes", "Examen").nombre).toBe("Exámenes");
  });

  it("exige un nombre no vacío", () => {
    expect(() => new CriterioPorAsunto("   ", "Examen")).toThrow();
  });

  it("aplicar usa el predicado de la subclase y conserva el orden", () => {
    const a = nuevo("Examen 1");
    const b = nuevo("Reunión");
    const c = nuevo("Examen 2");
    expect(new CriterioPorAsunto("Exámenes", "Examen").aplicar([a, b, c])).toEqual([a, c]);
  });

  it("aplicar con una lista vacía devuelve una lista vacía", () => {
    expect(new CriterioPorAsunto("Exámenes", "Examen").aplicar([])).toEqual([]);
  });

  it("aplicar no modifica la lista original ni los correos", () => {
    const a = nuevo("Examen");
    const original = [a];
    const resultado = new CriterioPorAsunto("Exámenes", "Examen").aplicar(original);
    expect(original).toEqual([a]);
    expect(resultado).not.toBe(original);
    expect(a.leido).toBe(false);
    expect(a.asunto).toBe("Examen");
  });

  it("cumple la interfaz Filtro: se puede usar donde se espera un Filtro", () => {
    const filtro: Filtro = new CriterioPorAsunto("Exámenes", "Examen");
    const a = nuevo("Examen final");
    const b = nuevo("Reunión");
    expect(filtro.nombre).toBe("Exámenes");
    expect([a, b].filter(filtro.predicado)).toEqual([a]);
  });
});
