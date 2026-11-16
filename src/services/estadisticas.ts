import { Correo } from "../models/Correo";
import { Predicado } from "./predicados";

export interface Resumen {
  readonly total: number;
  readonly leidos: number;
  readonly noLeidos: number;
  readonly favoritos: number;
}

export const asuntos = (correos: ReadonlyArray<Correo>): string[] =>
  correos.map((correo) => correo.asunto);

export const filtrarPor = (correos: ReadonlyArray<Correo>, condicion: Predicado): Correo[] =>
  correos.filter(condicion);

export const resumir = (correos: ReadonlyArray<Correo>): Resumen =>
  correos.reduce<Resumen>(
    (acumulado, correo) => ({
      total: acumulado.total + 1,
      leidos: acumulado.leidos + (correo.leido ? 1 : 0),
      noLeidos: acumulado.noLeidos + (correo.leido ? 0 : 1),
      favoritos: acumulado.favoritos + (correo.favorito ? 1 : 0),
    }),
    { total: 0, leidos: 0, noLeidos: 0, favoritos: 0 }
  );
