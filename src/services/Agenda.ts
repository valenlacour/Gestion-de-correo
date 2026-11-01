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

  modificar(email: string, cambios: { nombreCompleto?: string; email?: string }): Contacto {
    const actual = this.obtener(email);
    if (!actual) {
      throw new Error("No existe un contacto con esa dirección de correo");
    }

    // Se crea un contacto nuevo: Contacto es inmutable y vuelve a validar los datos.
    const nuevo = new Contacto(
      cambios.nombreCompleto ?? actual.nombreCompleto,
      cambios.email ?? actual.email
    );

    if (nuevo.email !== actual.email && this.contactos.has(nuevo.email)) {
      throw new Error("Ya existe un contacto con esa dirección de correo");
    }

    this.contactos.delete(actual.email);
    this.contactos.set(nuevo.email, nuevo);
    return nuevo;
  }

  /** Quita el contacto de la agenda. No toca ningún correo. */
  eliminar(email: string): boolean {
    return this.contactos.delete(email.trim().toLowerCase());
  }
}
