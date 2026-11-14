import { Correo } from "../models/Correo";

/** Condición que se evalúa sobre un correo. No lo modifica ni guarda nada. */
export type Predicado = (correo: Correo) => boolean;

const normalizar = (texto: string): string => texto.trim().toLowerCase();

// ---- Predicados simples ----

/** El remitente pertenece exactamente a ese dominio (con o sin "@"). */
export const remitenteDeDominio = (dominio: string): Predicado => {
  const sufijo = "@" + normalizar(dominio).replace(/^@/, "");
  return (correo) => correo.remitente.email.toLowerCase().endsWith(sufijo);
};

/** El email del remitente coincide (sin distinguir mayúsculas). */
export const remitenteEs = (email: string): Predicado => {
  const buscado = normalizar(email);
  return (correo) => correo.remitente.email.toLowerCase() === buscado;
};

export const asuntoContiene = (texto: string): Predicado => {
  const buscado = normalizar(texto);
  return (correo) => correo.asunto.toLowerCase().includes(buscado);
};

export const cuerpoContiene = (texto: string): Predicado => {
  const buscado = normalizar(texto);
  return (correo) => correo.cuerpo.toLowerCase().includes(buscado);
};

export const leido: Predicado = (correo) => correo.leido;

export const favorito: Predicado = (correo) => correo.favorito;

// ---- Combinadores (funciones de orden superior) ----

/** Verdadero si todos los predicados lo son. Sin predicados: verdadero. */
export const and = (...predicados: Predicado[]): Predicado =>
  (correo) => predicados.every((p) => p(correo));

/** Verdadero si al menos un predicado lo es. Sin predicados: falso. */
export const or = (...predicados: Predicado[]): Predicado =>
  (correo) => predicados.some((p) => p(correo));

/** Invierte el resultado del predicado. */
export const not = (predicado: Predicado): Predicado =>
  (correo) => !predicado(correo);
