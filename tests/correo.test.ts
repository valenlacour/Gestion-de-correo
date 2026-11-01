import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const sofi = new Contacto("Sofía Ruiz", "sofia@ucp.edu.ar");

describe("RF-01 · Creación de correos", () => {
  it("conserva asunto, cuerpo, remitente y destinatarios", () => {
    const c = new Correo({
      asunto: "Examen final",
      cuerpo: "Fecha a confirmar",
      remitente: ana,
      destinatarios: [luis, sofi],
    });
    expect(c.asunto).toBe("Examen final");
    expect(c.cuerpo).toBe("Fecha a confirmar");
    expect(c.remitente).toBe(ana);
    expect(c.destinatarios).toEqual([luis, sofi]);
  });

  it("nace no leído y no favorito", () => {
    const c = new Correo({ asunto: "Hola", cuerpo: "Texto", remitente: ana, destinatarios: [luis] });
    expect(c.leido).toBe(false);
    expect(c.favorito).toBe(false);
  });

  it("permite crear múltiples correos con distintos remitentes y destinatarios", () => {
    const c1 = new Correo({ asunto: "A", cuerpo: "a", remitente: ana, destinatarios: [luis] });
    const c2 = new Correo({ asunto: "B", cuerpo: "b", remitente: luis, destinatarios: [ana, sofi] });
    expect(c1.remitente).toBe(ana);
    expect(c2.remitente).toBe(luis);
    expect(c2.destinatarios).toEqual([ana, sofi]);
  });

  it("cada correo tiene un identificador único", () => {
    const ids = Array.from({ length: 100 }, () => new Correo({ remitente: ana }).id);
    expect(new Set(ids).size).toBe(100);
  });

  it("exige un remitente", () => {
    expect(() => new Correo({ asunto: "Hola", remitente: undefined as unknown as Contacto })).toThrow("remitente");
  });
});

describe("RF-01 · Encapsulamiento de destinatarios", () => {
  it("el array recibido en el constructor no queda compartido con el correo", () => {
    const origen = [luis];
    const c = new Correo({ remitente: ana, destinatarios: origen });
    origen.push(sofi);
    expect(c.destinatarios).toEqual([luis]);
  });

  it("modificar la colección que devuelve el correo no altera el correo", () => {
    const c = new Correo({ remitente: ana, destinatarios: [luis] });
    const lista = c.destinatarios as Contacto[];
    try {
      lista.push(sofi);
    } catch {
      // si la colección está congelada, lanza un error: también es válido
    }
    expect(c.destinatarios).toEqual([luis]);
  });

  it("la colección expuesta está congelada", () => {
    const c = new Correo({ remitente: ana, destinatarios: [luis] });
    expect(Object.isFrozen(c.destinatarios)).toBe(true);
  });

  it("no repite destinatarios con la misma dirección", () => {
    const c = new Correo({
      remitente: ana,
      destinatarios: [luis, new Contacto("Luis G.", "LUIS@gmail.com"), sofi],
    });
    expect(c.destinatarios).toHaveLength(2);
  });

  it("valida que los destinatarios sean contactos", () => {
    expect(
      () => new Correo({ remitente: ana, destinatarios: [{ nombre: "x" } as unknown as Contacto] })
    ).toThrow("destinatario");
  });
});
