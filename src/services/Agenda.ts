import { Contacto } from "../models/Contacto";

/**
 * Agenda de contactos. Criterio anti-duplicados: la dirección de correo
 * (ya normalizada a minúsculas por Contacto) identifica a cada contacto.
 */
export class Agenda {
  private readonly contactos = new Map<string, Contacto>();

  agregar(nombreCompleto: string, email: string): Contacto {
    const contacto = new Contacto(nombreCompleto, email);
    if (this.contactos.has(contacto.email)) {
      throw new Error("Ya existe un contacto con esa dirección de correo");
    }
    this.contactos.set(contacto.email, contacto);
    return contacto;
  }

  obtener(email: string): Contacto | undefined {
    return this.contactos.get(email.trim().toLowerCase());
  }

  listar(): ReadonlyArray<Contacto> {
    return [...this.contactos.values()];
  }
}
