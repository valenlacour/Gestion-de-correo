import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const sofi = new Contacto("Sofía Ruiz", "sofia@ucp.edu.ar");

describe("RF-02 · Envío de correos", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  const total = () => Object.values(Bandeja).reduce((n, b) => n + gestor.correosDe(b).length, 0);

  it("un correo completo se puede enviar y queda en Enviados", () => {
    const c = new Correo({ remitente: ana, asunto: "Examen", cuerpo: "Texto", destinatarios: [luis] });
    const enviado = gestor.enviar(c);
    expect(gestor.bandejaDe(enviado)).toBe(Bandeja.Enviados);
    expect(gestor.correosDe(Bandeja.Enviados)).toEqual([enviado]);
  });

  it("se puede enviar a múltiples destinatarios", () => {
    const c = new Correo({ remitente: ana, asunto: "Aviso", destinatarios: [luis, sofi] });
    const enviado = gestor.enviar(c);
    expect(enviado.destinatarios).toEqual([luis, sofi]);
  });

  it("un correo enviado conserva sus datos e identificador", () => {
    const c = new Correo({ remitente: ana, asunto: "Examen", cuerpo: "Texto", destinatarios: [luis] });
    const enviado = gestor.enviar(c);
    expect(enviado.id).toBe(c.id);
    expect(enviado.asunto).toBe("Examen");
    expect(enviado.cuerpo).toBe("Texto");
    expect(enviado.remitente).toBe(ana);
  });

  it("un borrador válido enviado pasa a Enviados y deja de estar en Borradores", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    const enviado = gestor.enviar(b);
    expect(gestor.bandejaDe(enviado)).toBe(Bandeja.Enviados);
    expect(gestor.correosDe(Bandeja.Borradores)).toEqual([]);
    expect(gestor.correosDe(Bandeja.Enviados)).toEqual([enviado]);
  });

  it("enviar no genera registros duplicados", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    gestor.enviar(b);
    expect(total()).toBe(1);
  });

  it("no se puede enviar sin asunto válido", () => {
    expect(() => gestor.enviar(new Correo({ remitente: ana, destinatarios: [luis] }))).toThrow("asunto");
    expect(() => gestor.enviar(new Correo({ remitente: ana, asunto: "   ", destinatarios: [luis] }))).toThrow("asunto");
    expect(total()).toBe(0);
  });

  it("no se puede enviar sin destinatarios", () => {
    expect(() => gestor.enviar(new Correo({ remitente: ana, asunto: "Hola" }))).toThrow("destinatario");
    expect(total()).toBe(0);
  });

  it("un borrador inválido no se envía y sigue en Borradores", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Incompleto" });
    expect(() => gestor.enviar(b)).toThrow("destinatario");
    expect(gestor.bandejaDe(b)).toBe(Bandeja.Borradores);
    expect(gestor.correosDe(Bandeja.Enviados)).toEqual([]);
  });

  it("enviar un correo que ya fue enviado falla y no lo duplica", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    const enviado = gestor.enviar(b);
    expect(() => gestor.enviar(enviado)).toThrow("ya fue enviado");
    expect(gestor.correosDe(Bandeja.Enviados)).toHaveLength(1);
  });

  it("enviar un borrador editado envía su última versión", () => {
    const b = gestor.crearBorrador({ remitente: ana });
    gestor.editarBorrador(b, { asunto: "Examen", destinatarios: [luis] });
    const enviado = gestor.enviar(b); // b es la versión vieja
    expect(enviado.asunto).toBe("Examen");
    expect(enviado.destinatarios).toEqual([luis]);
    expect(gestor.correosDe(Bandeja.Enviados)).toEqual([enviado]);
  });

  it("no se puede enviar un correo que está en Entrada", () => {
    const c = new Correo({ remitente: luis, asunto: "Hola", destinatarios: [ana] });
    gestor.recibir(c);
    expect(() => gestor.enviar(c)).toThrow("No se puede enviar");
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Entrada);
  });

  it("no se puede enviar un borrador que está en Eliminados", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    gestor.eliminar(b);
    expect(() => gestor.enviar(b)).toThrow("No se puede enviar");
  });

  it("un correo enviado ya no se puede editar como borrador", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    const enviado = gestor.enviar(b);
    expect(() => gestor.editarBorrador(enviado, { asunto: "Otro" })).toThrow("no es un borrador");
  });

  it("un correo enviado se puede eliminar y restaurar a Enviados", () => {
    const c = new Correo({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    const enviado = gestor.enviar(c);
    gestor.eliminar(enviado);
    gestor.restaurar(enviado);
    expect(gestor.bandejaDe(enviado)).toBe(Bandeja.Enviados);
    expect(total()).toBe(1);
  });
});
