import { Correo } from "../models/Correo";
import { Contacto } from "../models/Contacto";

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


const contiene = (campo: string, texto: string): boolean => campo.toLowerCase().includes(texto);

const coincideContacto = (contacto: Contacto, texto: string): boolean =>
  contiene(contacto.nombreCompleto, texto) || contiene(contacto.email, texto);

/**
 * RF-04: búsqueda de texto libre. Un correo coincide si el texto aparece (sin distinguir
 * mayúsculas y de forma parcial) en el asunto, el cuerpo, o el nombre o email del
 * remitente o de cualquier destinatario. Función pura: no modifica nada.
 */
export const buscar = (correos: ReadonlyArray<Correo>, texto: string): Correo[] => {
  const buscado = texto.trim().toLowerCase();
  if (buscado === "") return [];

  return correos.filter(
    (correo) =>
      contiene(correo.asunto, buscado) ||
      contiene(correo.cuerpo, buscado) ||
      coincideContacto(correo.remitente, buscado) ||
      correo.destinatarios.some((destinatario) => coincideContacto(destinatario, buscado))
  );
};
