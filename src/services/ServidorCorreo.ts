import { Usuario } from "../models/Usuario";

/**
 * Servidor de correo simulado: registra a los usuarios por su email.
 * La entrega de correos entre usuarios se agrega en el siguiente ciclo.
 */
export class ServidorCorreo {
  private readonly usuarios = new Map<string, Usuario>();

  registrar(nombreCompleto: string, email: string): Usuario {
    const usuario = new Usuario(nombreCompleto, email); // valida los datos
    if (this.usuarios.has(usuario.contacto.email)) {
      throw new Error("Ya existe un usuario con esa dirección de correo");
    }
    this.usuarios.set(usuario.contacto.email, usuario);
    return usuario;
  }

  obtener(email: string): Usuario | undefined {
    return this.usuarios.get(email.trim().toLowerCase());
  }
}
