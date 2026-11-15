import { and, Predicado } from "../predicados";
import { CriterioCompuesto } from "./CriterioCompuesto";

export class CriterioY extends CriterioCompuesto {
  get predicado(): Predicado {
    return and(...this.hijos.map((hijo) => hijo.predicado));
  }
}
