import { Correo } from "../models/Correo";

/**
 * RF-08: devuelve los correos no leídos de una colección.
 * Función pura: no guarda nada ni modifica los correos. Como consulta el estado
 * en el momento de llamarla, siempre refleja el último cambio de lectura.
 */
export const noLeidos = (correos: ReadonlyArray<Correo>): Correo[] =>
  correos.filter((correo) => !correo.leido);

/**
 * RF-09: devuelve los correos marcados como favoritos de una colección.
 * Función pura: no guarda nada ni modifica los correos.
 */
export const favoritos = (correos: ReadonlyArray<Correo>): Correo[] =>
  correos.filter((correo) => correo.favorito);
