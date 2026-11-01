export class Contacto {
  public readonly nombreCompleto: string;
  public readonly email: string;

  constructor(nombreCompleto: string, email: string) {
    const nombre = nombreCompleto.trim();
    const mail = email.trim();

    if (nombre === "") {
      throw new Error("El nombre completo es obligatorio");
    }
    if (mail === "") {
      throw new Error("La dirección de correo es obligatoria");
    }

    this.nombreCompleto = nombre;
    this.email = mail;
  }
}
