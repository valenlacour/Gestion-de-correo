export class Contacto {
  public readonly nombreCompleto: string;
  public readonly email: string;

  constructor(nombreCompleto: string, email: string) {
    const nombre = nombreCompleto.trim();
    if (nombre === "") {
      throw new Error("El nombre completo es obligatorio");
    }
    this.nombreCompleto = nombre;
    this.email = email;
  }
}
