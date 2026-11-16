import { noLeidos } from "../src/services/consultas";
import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

describe("RF-08 · no leídos por bandeja", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("devuelve solo los no leídos de la bandeja de entrada", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    b.marcarComoLeido();
    gestor.recibir(a);
    gestor.recibir(b);
    expect(noLeidos(gestor.correosDe(Bandeja.Entrada))).toEqual([a]);
  });

  it("devuelve vacío si todos los correos de la bandeja fueron leídos", () => {
    const a = nuevo("A");
    a.marcarComoLeido();
    gestor.recibir(a);
    expect(noLeidos(gestor.correosDe(Bandeja.Entrada))).toEqual([]);
  });

  it("devuelve vacío en una bandeja sin correos", () => {
    expect(noLeidos(gestor.correosDe(Bandeja.Eliminados))).toEqual([]);
  });

  it("no mezcla correos de otras bandejas", () => {
    const recibido = nuevo("Recibido");
    gestor.recibir(recibido);
    const borrador = gestor.crearBorrador({ remitente: ana, asunto: "Borrador", destinatarios: [luis] });
    expect(noLeidos(gestor.correosDe(Bandeja.Entrada))).toEqual([recibido]);
    expect(noLeidos(gestor.correosDe(Bandeja.Borradores))).toEqual([borrador]);
  });

  it("refleja que un correo leído deja de aparecer", () => {
    const a = nuevo("A");
    gestor.recibir(a);
    expect(noLeidos(gestor.correosDe(Bandeja.Entrada))).toEqual([a]);
    a.marcarComoLeido();
    expect(noLeidos(gestor.correosDe(Bandeja.Entrada))).toEqual([]);
  });
});
