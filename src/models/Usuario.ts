import { Contacto } from "./Contacto";
import { Agenda } from "../services/Agenda";
import { GestorCorreos } from "../services/GestorCorreos";

/**
 * Una persona del sistema. Tiene su propio contacto (nombre y email),
 * su propia agenda y su propio gestor, o sea sus propias 4 bandejas.
 */
export class Usuario {
  public readonly contacto: Contacto;
  public readonly agenda = new Agenda();
  public readonly gestor = new GestorCorreos();

  constructor(nombreCompleto: string, email: string) {
    this.contacto = new Contacto(nombreCompleto, email); // valida nombre y email
  }
}
