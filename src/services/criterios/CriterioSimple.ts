import { Predicado } from "../predicados";
import { CriterioFiltro } from "./CriterioFiltro";

export class CriterioSimple extends CriterioFiltro {
  constructor(nombre: string, private readonly condicion: Predicado) {
    super(nombre);
  }

  get predicado(): Predicado {
    return this.condicion;
  }
}
