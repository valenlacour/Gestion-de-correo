import { noLeidos } from "../src/services/consultas";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

describe("RF-08 · Correos no leídos", () => {
  it("devuelve solo los no leídos, en el mismo orden", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    const c = nuevo("C");
    b.marcarComoLeido();
    expect(noLeidos([a, b, c])).toEqual([a, c]);
  });

  it("con una lista vacía devuelve una lista vacía", () => {
    expect(noLeidos([])).toEqual([]);
  });

  it("si todos están leídos devuelve una lista vacía", () => {
    const a = nuevo("A");
    a.marcarComoLeido();
    expect(noLeidos([a])).toEqual([]);
  });

  it("refleja el cambio de estado sin guardar nada: al marcar como leído deja de aparecer", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    expect(noLeidos([a, b])).toEqual([a, b]);
    a.marcarComoLeido();
    expect(noLeidos([a, b])).toEqual([b]);
    a.marcarComoNoLeido();
    expect(noLeidos([a, b])).toEqual([a, b]);
  });

  it("no modifica la lista original ni los correos", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    b.marcarComoLeido();
    const original = [a, b];
    const resultado = noLeidos(original);
    expect(original).toEqual([a, b]);
    expect(resultado).not.toBe(original);
    expect(b.leido).toBe(true);
  });
});
