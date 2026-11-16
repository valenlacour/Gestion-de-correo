import { or, Predicado } from "../predicados";
import { CriterioCompuesto } from "./CriterioCompuesto";

export class CriterioO extends CriterioCompuesto {
  get predicado(): Predicado {
    return or(...this.hijos.map((hijo) => hijo.predicado));
  }
}
