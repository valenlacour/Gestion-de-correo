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
  public readonly destinatarios: Contacto[];
  private _leido = false;
  private _favorito = false;

  constructor(datos: DatosCorreo) {
    if (!(datos.remitente instanceof Contacto)) {
      throw new Error("El remitente es obligatorio y debe ser un contacto");
    }

    this.id = randomUUID();
    this.asunto = datos.asunto ?? "";
    this.cuerpo = datos.cuerpo ?? "";
    this.remitente = datos.remitente;
    this.destinatarios = datos.destinatarios ?? [];
  }

  get leido(): boolean {
    return this._leido;
  }

  get favorito(): boolean {
    return this._favorito;
  }
}
