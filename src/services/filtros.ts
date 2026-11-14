import { Correo } from "../models/Correo";
import { Predicado } from "./predicados";

export const MAX_FILTROS = 5;

/** Un filtro es un nombre y una condición. No guarda correos. */
export interface Filtro {
  readonly nombre: string;
  readonly predicado: Predicado;
}

const clave = (nombre: string): string => nombre.trim().toLowerCase();

export class RegistroFiltros {
  private readonly filtros = new Map<string, Filtro>();

  registrar(nombre: string, predicado: Predicado): Filtro {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio === "") {
      throw new Error("El filtro debe tener un nombre");
    }
    if (this.filtros.has(clave(nombreLimpio))) {
      throw new Error(`Ya existe un filtro llamado "${nombreLimpio}"`);
    }
    if (this.filtros.size >= MAX_FILTROS) {
      throw new Error(`No se pueden registrar más de ${MAX_FILTROS} filtros`);
    }
    const filtro: Filtro = Object.freeze({ nombre: nombreLimpio, predicado });
    this.filtros.set(clave(nombreLimpio), filtro);
    return filtro;
  }

  obtener(nombre: string): Filtro | undefined {
    return this.filtros.get(clave(nombre));
  }

  listar(): ReadonlyArray<Filtro> {
    return [...this.filtros.values()];
  }

  /** Evalúa el filtro sobre la colección recibida. No la modifica. */
  aplicar(nombre: string, correos: ReadonlyArray<Correo>): Correo[] {
    const filtro = this.obtener(nombre);
    if (filtro === undefined) {
      throw new Error(`No existe el filtro "${nombre}"`);
    }
    return correos.filter(filtro.predicado);
  }
}
