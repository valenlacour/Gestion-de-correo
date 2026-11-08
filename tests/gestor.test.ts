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

describe("RF-06 · Mover, eliminar y restaurar", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  const total = () => Object.values(Bandeja).reduce((n, b) => n + gestor.correosDe(b).length, 0);

  it("eliminar traslada el correo de su bandeja a Eliminados", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    gestor.eliminar(c);
    expect(gestor.correosDe(Bandeja.Entrada)).toEqual([]);
    expect(gestor.correosDe(Bandeja.Eliminados)).toEqual([c]);
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Eliminados);
  });

  it("eliminar no genera duplicados", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    gestor.eliminar(c);
    expect(total()).toBe(1);
  });

  it("restaurar devuelve el correo a su bandeja de origen", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    gestor.eliminar(c);
    gestor.restaurar(c);
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Entrada);
    expect(gestor.correosDe(Bandeja.Eliminados)).toEqual([]);
    expect(total()).toBe(1);
  });

  it("eliminar y restaurar conservan el estado de lectura y favorito", () => {
    const c = nuevoCorreo();
    c.marcarComoLeido();
    gestor.recibir(c);
    gestor.eliminar(c);
    gestor.restaurar(c);
    expect(c.leido).toBe(true);
  });

  it("no se puede eliminar un correo que ya está en Eliminados", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    gestor.eliminar(c);
    expect(() => gestor.eliminar(c)).toThrow("ya está en Eliminados");
  });

  it("no se puede restaurar un correo que no está en Eliminados", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    expect(() => gestor.restaurar(c)).toThrow("no está en Eliminados");
  });

  it("rechaza movimientos no permitidos, como pasar un correo recibido a Enviados", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    expect(() => gestor.mover(c, Bandeja.Enviados)).toThrow("Movimiento no permitido");
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Entrada);
  });

  it("mover a Eliminados equivale a eliminar", () => {
    const c = nuevoCorreo();
    gestor.recibir(c);
    gestor.mover(c, Bandeja.Eliminados);
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Eliminados);
  });

  it("falla si el correo no está registrado en el gestor", () => {
    expect(() => gestor.eliminar(nuevoCorreo())).toThrow("no está registrado");
    expect(() => gestor.restaurar(nuevoCorreo())).toThrow("no está registrado");
  });
});
