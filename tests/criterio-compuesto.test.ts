import { CriterioCompuesto } from "../src/services/criterios/CriterioCompuesto";
import { CriterioFiltro } from "../src/services/criterios/CriterioFiltro";
import { CriterioSimple } from "../src/services/criterios/CriterioSimple";
import { Filtro, RegistroFiltros } from "../src/services/filtros";
import { Predicado } from "../src/services/predicados";

class CompuestoDePrueba extends CriterioCompuesto {
  get predicado(): Predicado {
    return () => true;
  }

  cantidadDeHijos(): number {
    return this.hijos.length;
  }
}

const siempre = (nombre: string) => new CriterioSimple(nombre, () => true);

describe("RF-05 · clase abstracta CriterioCompuesto", () => {
  it("es un CriterioFiltro (segundo nivel de herencia)", () => {
    expect(new CompuestoDePrueba("Dos", [siempre("A"), siempre("B")])).toBeInstanceOf(CriterioFiltro);
  });

  it("exige al menos dos filtros", () => {
    expect(() => new CompuestoDePrueba("Ninguno", [])).toThrow();
    expect(() => new CompuestoDePrueba("Uno", [siempre("A")])).toThrow();
    expect(new CompuestoDePrueba("Dos", [siempre("A"), siempre("B")]).cantidadDeHijos()).toBe(2);
  });

  it("copia la lista de filtros: cambiarla desde afuera no lo afecta", () => {
    const hijos = [siempre("A"), siempre("B")];
    const compuesto = new CompuestoDePrueba("Dos", hijos);
    hijos.push(siempre("C"));
    expect(compuesto.cantidadDeHijos()).toBe(2);
  });

  it("acepta cualquier objeto que cumpla la interfaz Filtro", () => {
    const armadoAMano: Filtro = { nombre: "Armado a mano", predicado: () => true };
    expect(new CompuestoDePrueba("Mixto", [siempre("A"), armadoAMano]).cantidadDeHijos()).toBe(2);
  });

  it("acepta como hijo un filtro que devolvió el RegistroFiltros", () => {
    const registro = new RegistroFiltros();
    const registrado = registro.registrar("Registrado", () => true);
    expect(new CompuestoDePrueba("Mixto", [siempre("A"), registrado]).cantidadDeHijos()).toBe(2);
  });
});
