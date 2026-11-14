import { Usuario } from "../src/models/Usuario";
import { ServidorCorreo } from "../src/services/ServidorCorreo";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";

describe("Usuario", () => {
  it("tiene un contacto con su nombre y su email", () => {
    const u = new Usuario("Ana Pérez", "ANA@ucp.edu.ar");
    expect(u.contacto.nombreCompleto).toBe("Ana Pérez");
    expect(u.contacto.email).toBe("ana@ucp.edu.ar");
  });

  it("valida el nombre y el email como cualquier contacto", () => {
    expect(() => new Usuario("", "ana@ucp.edu.ar")).toThrow("nombre");
    expect(() => new Usuario("Ana", "no-es-un-mail")).toThrow("formato");
  });

  it("cada usuario tiene su propia agenda y su propio gestor", () => {
    const ana = new Usuario("Ana Pérez", "ana@ucp.edu.ar");
    const luis = new Usuario("Luis Gómez", "luis@gmail.com");
    expect(ana.agenda).not.toBe(luis.agenda);
    expect(ana.gestor).not.toBe(luis.gestor);
  });

  it("las bandejas de un usuario son independientes de las de otro", () => {
    const ana = new Usuario("Ana Pérez", "ana@ucp.edu.ar");
    const luis = new Usuario("Luis Gómez", "luis@gmail.com");
    ana.gestor.recibir(new Correo({ remitente: luis.contacto, asunto: "Hola", destinatarios: [ana.contacto] }));
    expect(ana.gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toHaveLength(0);
  });

  it("la agenda de un usuario es independiente de la de otro", () => {
    const ana = new Usuario("Ana Pérez", "ana@ucp.edu.ar");
    const luis = new Usuario("Luis Gómez", "luis@gmail.com");
    ana.agenda.agregar("Sofía Ruiz", "sofia@ucp.edu.ar");
    expect(ana.agenda.listar()).toHaveLength(1);
    expect(luis.agenda.listar()).toEqual([]);
  });
});

describe("ServidorCorreo · registro de usuarios", () => {
  let servidor: ServidorCorreo;

  beforeEach(() => {
    servidor = new ServidorCorreo();
  });

  it("registra un usuario y lo encuentra por su email, sin distinguir mayúsculas", () => {
    const ana = servidor.registrar("Ana Pérez", "ana@ucp.edu.ar");
    expect(servidor.obtener("ANA@ucp.edu.ar")).toBe(ana);
  });

  it("no permite registrar dos usuarios con el mismo email", () => {
    servidor.registrar("Ana Pérez", "ana@ucp.edu.ar");
    expect(() => servidor.registrar("Otra Ana", "ANA@ucp.edu.ar")).toThrow("existe");
  });

  it("devuelve undefined si el usuario no está registrado", () => {
    expect(servidor.obtener("nadie@ucp.edu.ar")).toBeUndefined();
  });
});
