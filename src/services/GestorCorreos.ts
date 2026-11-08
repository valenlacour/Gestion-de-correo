import { Bandeja } from "../models/Bandeja";
import { Correo, DatosCorreo } from "../models/Correo";

interface Registro {
  correo: Correo;
  bandeja: Bandeja;
  origen?: Bandeja; // bandeja de la que vino, para poder restaurarlo
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

  /** RF-07: registra un borrador. Puede estar incompleto; solo exige el remitente. */
  crearBorrador(datos: DatosCorreo): Correo {
    const borrador = new Correo(datos); // valida el remitente
    this.registros.set(borrador.id, { correo: borrador, bandeja: Bandeja.Borradores });
    return borrador;
  }

  correosDe(bandeja: Bandeja): ReadonlyArray<Correo> {
    return [...this.registros.values()]
      .filter((r) => r.bandeja === bandeja)
      .map((r) => r.correo);
  }

  bandejaDe(correo: Correo): Bandeja | undefined {
    return this.registros.get(correo.id)?.bandeja;
  }

  /** Eliminación lógica: pasa el correo a Eliminados recordando su origen. */
  eliminar(correo: Correo): void {
    const registro = this.obtenerRegistro(correo);
    if (registro.bandeja === Bandeja.Eliminados) {
      throw new Error("El correo ya está en Eliminados");
    }
    registro.origen = registro.bandeja;
    registro.bandeja = Bandeja.Eliminados;
  }

  /** Devuelve un correo eliminado a su bandeja de origen. */
  restaurar(correo: Correo): void {
    const registro = this.obtenerRegistro(correo);
    if (registro.bandeja !== Bandeja.Eliminados) {
      throw new Error("El correo no está en Eliminados");
    }
    registro.bandeja = registro.origen ?? Bandeja.Entrada;
    registro.origen = undefined;
  }

  /** Movimientos permitidos: a Eliminados desde cualquier bandeja, y de Eliminados a su origen. */
  mover(correo: Correo, destino: Bandeja): void {
    if (destino === Bandeja.Eliminados) {
      this.eliminar(correo);
      return;
    }
    const registro = this.obtenerRegistro(correo);
    if (registro.bandeja === Bandeja.Eliminados && registro.origen === destino) {
      this.restaurar(correo);
      return;
    }
    throw new Error(`Movimiento no permitido: de ${registro.bandeja} a ${destino}`);
  }

  private obtenerRegistro(correo: Correo): Registro {
    const registro = this.registros.get(correo.id);
    if (!registro) {
      throw new Error("El correo no está registrado en el gestor");
    }
    return registro;
  }
}
