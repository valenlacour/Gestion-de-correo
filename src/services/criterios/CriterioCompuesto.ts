import { Filtro } from "../filtros";
import { CriterioFiltro } from "./CriterioFiltro";

export abstract class CriterioCompuesto extends CriterioFiltro {
  protected readonly hijos: ReadonlyArray<Filtro>;

  constructor(nombre: string, hijos: ReadonlyArray<Filtro>) {
    super(nombre);
    if (hijos.length < 2) {
      throw new Error("Un criterio compuesto necesita al menos dos filtros");
    }
    this.hijos = [...hijos];
  }
}
