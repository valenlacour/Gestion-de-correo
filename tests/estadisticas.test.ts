import { asuntos, resumir } from "../src/services/estadisticas";
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

describe("RF-10 · resumir", () => {
  it("devuelve todo en cero si no hay correos", () => {
    expect(resumir([])).toEqual({ total: 0, leidos: 0, noLeidos: 0, favoritos: 0 });
  });

  it("cuenta total, leídos, no leídos y favoritos", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    const c = nuevo("C");
    b.marcarComoLeido();
    c.marcarComoLeido();
    c.marcarComoFavorito();
    expect(resumir([a, b, c])).toEqual({ total: 3, leidos: 2, noLeidos: 1, favoritos: 1 });
  });

  it("leídos más no leídos siempre suman el total", () => {
    const correos = [nuevo("A"), nuevo("B"), nuevo("C"), nuevo("D")];
    correos[1].marcarComoLeido();
    const resumen = resumir(correos);
    expect(resumen.leidos + resumen.noLeidos).toBe(resumen.total);
  });

  it("no modifica la colección original", () => {
    const correos = [nuevo("A"), nuevo("B")];
    const copia = [...correos];
    resumir(correos);
    expect(correos).toEqual(copia);
  });
});
