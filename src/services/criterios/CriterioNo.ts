import { Filtro } from "../filtros";
import { not, Predicado } from "../predicados";
import { CriterioFiltro } from "./CriterioFiltro";

export class CriterioNo extends CriterioFiltro {
  constructor(nombre: string, private readonly negado: Filtro) {
    super(nombre);
  }

  get predicado(): Predicado {
    return not(this.negado.predicado);
  }
}
