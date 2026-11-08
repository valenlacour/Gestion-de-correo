import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevoCorreo = (asunto = "Hola") =>
  new Correo({ asunto, cuerpo: "Texto", remitente: luis, destinatarios: [ana] });

describe("RF-06 · Bandejas", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("las cuatro bandejas empiezan vacías", () => {
    for (const bandeja of Object.values(Bandeja)) {
      expect(gestor.correosDe(bandeja)).toEqual([]);
    }
  });

  it("un correo recibido queda en la Bandeja de Entrada", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    expect(gestor.correosDe(Bandeja.Entrada)).toEqual([c]);
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Entrada);
  });

  it("cada correo pertenece a una única bandeja", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    const apariciones = Object.values(Bandeja).filter((b) => gestor.correosDe(b).includes(c));
    expect(apariciones).toEqual([Bandeja.Entrada]);
  });

  it("recibir dos veces el mismo correo no genera duplicados", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    expect(() => gestor.recibir(c)).toThrow("ya está registrado");
    expect(gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
  });

  it("la lista que devuelve el gestor no expone la bandeja interna", () => {
    gestor.recibir(nuevoCorreo());
    const lista = gestor.correosDe(Bandeja.Entrada) as Correo[];
    lista.pop();
    expect(gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
  });

  it("bandejaDe devuelve undefined para un correo desconocido", () => {
    expect(gestor.bandejaDe(nuevoCorreo())).toBeUndefined();
  });
});
