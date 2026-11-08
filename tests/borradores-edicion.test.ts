import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const sofi = new Contacto("Sofía Ruiz", "sofia@ucp.edu.ar");

describe("RF-07 · Editar y recuperar borradores", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("editar conserva los cambios en el borrador", () => {
    const b = gestor.crearBorrador({ remitente: ana });
    const editado = gestor.editarBorrador(b, {
      asunto: "Examen",
      cuerpo: "Fecha a confirmar",
      destinatarios: [luis],
    });
    expect(editado.asunto).toBe("Examen");
    expect(editado.cuerpo).toBe("Fecha a confirmar");
    expect(editado.destinatarios).toEqual([luis]);
    expect(editado.remitente).toBe(ana);
  });

  it("el borrador editado mantiene su identidad y sigue en Borradores sin duplicarse", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Hola" });
    const editado = gestor.editarBorrador(b, { asunto: "Hola de nuevo" });
    expect(editado.id).toBe(b.id);
    expect(gestor.bandejaDe(editado)).toBe(Bandeja.Borradores);
    expect(gestor.correosDe(Bandeja.Borradores)).toEqual([editado]);
  });

  it("una edición parcial no pisa los demás campos", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", cuerpo: "Texto", destinatarios: [luis] });
    const editado = gestor.editarBorrador(b, { cuerpo: "Texto nuevo" });
    expect(editado.asunto).toBe("Examen");
    expect(editado.cuerpo).toBe("Texto nuevo");
    expect(editado.destinatarios).toEqual([luis]);
  });

  it("se puede editar varias veces, completando el borrador de a poco", () => {
    let b = gestor.crearBorrador({ remitente: ana });
    b = gestor.editarBorrador(b, { asunto: "Reunión" });
    b = gestor.editarBorrador(b, { destinatarios: [luis, sofi] });
    b = gestor.editarBorrador(b, { cuerpo: "Nos vemos el lunes" });
    expect(b.asunto).toBe("Reunión");
    expect(b.destinatarios).toEqual([luis, sofi]);
    expect(b.cuerpo).toBe("Nos vemos el lunes");
    expect(gestor.correosDe(Bandeja.Borradores)).toHaveLength(1);
  });

  it("conserva el estado de lectura al editar", () => {
    const b = gestor.crearBorrador({ remitente: ana });
    b.marcarComoLeido();
    const editado = gestor.editarBorrador(b, { asunto: "Nuevo" });
    expect(editado.leido).toBe(true);
  });

  it("no se puede editar un correo que no está en Borradores", () => {
    const c = new Correo({ remitente: luis, asunto: "Original" });
    gestor.recibir(c);
    expect(() => gestor.editarBorrador(c, { asunto: "Cambiado" })).toThrow("no es un borrador");
    expect(c.asunto).toBe("Original");
  });

  it("falla si el borrador no está registrado en el gestor", () => {
    const suelto = new Correo({ remitente: ana });
    expect(() => gestor.editarBorrador(suelto, { asunto: "X" })).toThrow("no está registrado");
  });

  it("una edición inválida no cambia el borrador", () => {
    const b = gestor.crearBorrador({ remitente: ana, destinatarios: [luis] });
    expect(() =>
      gestor.editarBorrador(b, { destinatarios: [{ nombre: "x" } as unknown as Contacto] })
    ).toThrow("destinatario");
    expect(gestor.correosDe(Bandeja.Borradores)[0].destinatarios).toEqual([luis]);
  });

  it("recupera un borrador por su id, con los últimos cambios", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Hola" });
    const editado = gestor.editarBorrador(b, { asunto: "Hola editado" });
    expect(gestor.obtenerBorrador(b.id)).toBe(editado);
  });

  it("obtenerBorrador devuelve undefined si el id no corresponde a un borrador", () => {
    const c = new Correo({ remitente: luis });
    gestor.recibir(c);
    expect(gestor.obtenerBorrador(c.id)).toBeUndefined();
    expect(gestor.obtenerBorrador("no-existe")).toBeUndefined();
  });
});
