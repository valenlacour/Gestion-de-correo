import { Usuario } from "../models/Usuario";
import { Correo } from "../models/Correo";

/**
 * Servidor de correo simulado. Registra a los usuarios por su email y entrega
 * los correos enviados a la Entrada de cada destinatario que sea usuario.
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

  /**
   * El usuario envía un correo. Queda en sus Enviados (con las validaciones del gestor)
   * y cada destinatario registrado recibe su propia copia en la Entrada.
   */
  enviar(remitente: Usuario, correo: Correo): Correo {
    if (this.usuarios.get(remitente.contacto.email) !== remitente) {
      throw new Error("El usuario no está registrado en el servidor");
    }
    if (!remitente.contacto.esIgualA(correo.remitente)) {
      throw new Error("El remitente del correo no es el usuario que lo envía");
    }

    const enviado = remitente.gestor.enviar(correo); // valida; si falla, no se entrega nada

    for (const destinatario of enviado.destinatarios) {
      // Si el destinatario no es un usuario del servidor (mail externo), no se entrega.
      this.usuarios.get(destinatario.email)?.gestor.recibir(this.copiaDe(enviado));
    }
    return enviado;
  }

  /** Copia para un destinatario: mismo contenido, id nuevo y estado propio (no leída, no favorita). */
  private copiaDe(correo: Correo): Correo {
    return new Correo({
      asunto: correo.asunto,
      cuerpo: correo.cuerpo,
      remitente: correo.remitente,
      destinatarios: [...correo.destinatarios],
    });
  }
}
