import { Correo } from "../../models/Correo";
import { Filtro } from "../filtros";
import { Predicado } from "../predicados";

export abstract class CriterioFiltro implements Filtro {
  constructor(public readonly nombre: string) {
    if (nombre.trim() === "") {
      throw new Error("El criterio debe tener un nombre");
    }
  }

  abstract get predicado(): Predicado;

  aplicar(correos: ReadonlyArray<Correo>): Correo[] {
    return correos.filter(this.predicado);
  }
}
