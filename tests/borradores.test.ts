import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");

describe("RF-07 · Crear borradores", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("un borrador con solo el remitente queda en Borradores", () => {
    const b = gestor.crearBorrador({ remitente: ana });
    expect(gestor.bandejaDe(b)).toBe(Bandeja.Borradores);
    expect(gestor.correosDe(Bandeja.Borradores)).toEqual([b]);
  });

  it("un borrador puede estar incompleto: sin asunto, cuerpo ni destinatarios", () => {
    const b = gestor.crearBorrador({ remitente: ana });
    expect(b.asunto).toBe("");
    expect(b.cuerpo).toBe("");
    expect(b.destinatarios).toEqual([]);
  });

  it("conserva los datos parciales con los que se creó", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    expect(b.asunto).toBe("Examen");
    expect(b.cuerpo).toBe("");
    expect(b.destinatarios).toEqual([luis]);
  });

  it("se pueden crear varios borradores independientes", () => {
    const b1 = gestor.crearBorrador({ remitente: ana, asunto: "Uno" });
    const b2 = gestor.crearBorrador({ remitente: ana, asunto: "Dos" });
    expect(b1.id).not.toBe(b2.id);
    expect(gestor.correosDe(Bandeja.Borradores)).toHaveLength(2);
  });

  it("un borrador no aparece en las otras bandejas", () => {
    gestor.crearBorrador({ remitente: ana });
    expect(gestor.correosDe(Bandeja.Entrada)).toEqual([]);
    expect(gestor.correosDe(Bandeja.Enviados)).toEqual([]);
    expect(gestor.correosDe(Bandeja.Eliminados)).toEqual([]);
  });

  it("exige al menos un remitente", () => {
    expect(() => gestor.crearBorrador({} as never)).toThrow("remitente");
    expect(gestor.correosDe(Bandeja.Borradores)).toEqual([]);
  });
});
