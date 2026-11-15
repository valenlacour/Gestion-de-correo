import { asuntos } from "../src/services/estadisticas";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

describe("RF-10 · asuntos", () => {
  it("devuelve una lista vacía si no hay correos", () => {
    expect(asuntos([])).toEqual([]);
  });

  it("devuelve los asuntos en el mismo orden de los correos", () => {
    expect(asuntos([nuevo("Examen"), nuevo("Fotos"), nuevo("Aviso")])).toEqual(["Examen", "Fotos", "Aviso"]);
  });

  it("conserva los asuntos repetidos", () => {
    expect(asuntos([nuevo("Aviso"), nuevo("Aviso")])).toEqual(["Aviso", "Aviso"]);
  });

  it("no modifica la colección original", () => {
    const correos = [nuevo("A"), nuevo("B")];
    const copia = [...correos];
    asuntos(correos);
    expect(correos).toEqual(copia);
  });
});
