import { Bandeja } from "../models/Bandeja";
import { Correo } from "../models/Correo";

interface Registro {
  correo: Correo;
  bandeja: Bandeja;
}

/**
 * Administra las cuatro bandejas. Guarda cada correo UNA sola vez, junto con
 * la bandeja en la que está: así nunca puede estar en dos a la vez ni duplicarse.
 */
export class GestorCorreos {
  private readonly registros = new Map<string, Registro>();

  recibir(correo: Correo): void {
    if (this.registros.has(correo.id)) {
      throw new Error("El correo ya está registrado en el gestor");
    }
    this.registros.set(correo.id, { correo, bandeja: Bandeja.Entrada });
  }

  correosDe(bandeja: Bandeja): ReadonlyArray<Correo> {
    return [...this.registros.values()]
      .filter((r) => r.bandeja === bandeja)
      .map((r) => r.correo);
  }

  bandejaDe(correo: Correo): Bandeja | undefined {
    return this.registros.get(correo.id)?.bandeja;
  }
}
