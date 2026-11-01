const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Contacto {
  public readonly nombreCompleto: string;
  public readonly email: string;

  constructor(nombreCompleto: string, email: string) {
    const nombre = nombreCompleto.trim();
    const mail = email.trim().toLowerCase();

    if (nombre === "") {
      throw new Error("El nombre completo es obligatorio");
    }
    if (mail === "") {
      throw new Error("La dirección de correo es obligatoria");
    }
    if (!FORMATO_EMAIL.test(mail)) {
      throw new Error("La dirección de correo tiene un formato inválido");
    }

    this.nombreCompleto = nombre;
    this.email = mail;
  }

  /** Dos contactos son el mismo si comparten dirección de correo. */
  esIgualA(otro: Contacto): boolean {
    return this.email === otro.email;
  }
}
