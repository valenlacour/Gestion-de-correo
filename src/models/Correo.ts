import { randomUUID } from "crypto";
import { Contacto } from "./Contacto";

export interface DatosCorreo {
  asunto?: string;
  cuerpo?: string;
  remitente: Contacto;
  destinatarios?: Contacto[];
}

export class Correo {
  public readonly id: string;
  public readonly asunto: string;
  public readonly cuerpo: string;
  public readonly remitente: Contacto;
  private readonly _destinatarios: Contacto[];
  private _leido = false;
  private _favorito = false;

  constructor(datos: DatosCorreo) {
    if (!(datos.remitente instanceof Contacto)) {
      throw new Error("El remitente es obligatorio y debe ser un contacto");
    }

    const destinatarios = datos.destinatarios ?? [];
    if (!destinatarios.every((d) => d instanceof Contacto)) {
      throw new Error("Todos los destinatarios deben ser contactos");
    }

    this.id = randomUUID();
    this.asunto = datos.asunto ?? "";
    this.cuerpo = datos.cuerpo ?? "";
    this.remitente = datos.remitente;
    // Copia propia (no se comparte el array de afuera) y sin repetir direcciones.
    this._destinatarios = destinatarios.filter(
      (d, i) => destinatarios.findIndex((x) => x.esIgualA(d)) === i
    );
  }

  /** Colección de solo lectura: no expone la lista interna. */
  get destinatarios(): ReadonlyArray<Contacto> {
    return Object.freeze([...this._destinatarios]);
  }

  get leido(): boolean {
    return this._leido;
  }

  get favorito(): boolean {
    return this._favorito;
  }

  marcarComoLeido(): void {
    this._leido = true;
  }

  marcarComoNoLeido(): void {
    this._leido = false;
  }
}
