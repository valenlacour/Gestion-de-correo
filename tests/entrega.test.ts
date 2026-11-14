import { ServidorCorreo } from "../src/services/ServidorCorreo";
import { Usuario } from "../src/models/Usuario";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

describe("ServidorCorreo · envío entre usuarios", () => {
  let servidor: ServidorCorreo;
  let ana: Usuario;
  let luis: Usuario;
  let sofi: Usuario;

  beforeEach(() => {
    servidor = new ServidorCorreo();
    ana = servidor.registrar("Ana Pérez", "ana@ucp.edu.ar");
    luis = servidor.registrar("Luis Gómez", "luis@gmail.com");
    sofi = servidor.registrar("Sofía Ruiz", "sofia@ucp.edu.ar");
  });

  const correo = (remitente: Usuario, destinatarios: Contacto[], asunto = "Examen") =>
    new Correo({ remitente: remitente.contacto, asunto, cuerpo: "Texto", destinatarios });

  it("el correo enviado queda en Enviados del remitente", () => {
    const enviado = servidor.enviar(ana, correo(ana, [luis.contacto]));
    expect(ana.gestor.correosDe(Bandeja.Enviados)).toEqual([enviado]);
  });

  it("se entrega una copia en la Entrada del destinatario", () => {
    servidor.enviar(ana, correo(ana, [luis.contacto]));
    const recibidos = luis.gestor.correosDe(Bandeja.Entrada);
    expect(recibidos).toHaveLength(1);
    expect(recibidos[0].asunto).toBe("Examen");
    expect(recibidos[0].remitente.email).toBe("ana@ucp.edu.ar");
  });

  it("se entrega a cada destinatario que es usuario", () => {
    servidor.enviar(ana, correo(ana, [luis.contacto, sofi.contacto]));
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
    expect(sofi.gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
  });

  it("el remitente no recibe una copia si no es destinatario", () => {
    servidor.enviar(ana, correo(ana, [luis.contacto]));
    expect(ana.gestor.correosDe(Bandeja.Entrada)).toEqual([]);
  });

  it("no entrega ni falla con destinatarios que no son usuarios", () => {
    const externo = new Contacto("Externo", "externo@yahoo.com");
    const enviado = servidor.enviar(ana, correo(ana, [luis.contacto, externo]));
    expect(enviado.destinatarios).toHaveLength(2);
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
  });

  it("la copia conserva los datos pero tiene otro identificador", () => {
    const enviado = servidor.enviar(ana, correo(ana, [luis.contacto, sofi.contacto]));
    const copia = luis.gestor.correosDe(Bandeja.Entrada)[0];
    expect(copia.id).not.toBe(enviado.id);
    expect(copia.asunto).toBe(enviado.asunto);
    expect(copia.cuerpo).toBe(enviado.cuerpo);
    expect(copia.destinatarios).toEqual(enviado.destinatarios);
  });

  it("las copias de distintos destinatarios son independientes", () => {
    servidor.enviar(ana, correo(ana, [luis.contacto, sofi.contacto]));
    const copiaLuis = luis.gestor.correosDe(Bandeja.Entrada)[0];
    const copiaSofi = sofi.gestor.correosDe(Bandeja.Entrada)[0];
    expect(copiaLuis.id).not.toBe(copiaSofi.id);
  });

  it("la copia llega no leída y no favorita aunque el original estuviera marcado", () => {
    const c = correo(ana, [luis.contacto]);
    c.marcarComoLeido();
    c.marcarComoFavorito();
    servidor.enviar(ana, c);
    const copia = luis.gestor.correosDe(Bandeja.Entrada)[0];
    expect(copia.leido).toBe(false);
    expect(copia.favorito).toBe(false);
  });

  it("el estado de lectura es independiente por usuario", () => {
    const enviado = servidor.enviar(ana, correo(ana, [luis.contacto, sofi.contacto]));
    const copiaLuis = luis.gestor.correosDe(Bandeja.Entrada)[0];
    const copiaSofi = sofi.gestor.correosDe(Bandeja.Entrada)[0];
    copiaLuis.marcarComoLeido();
    expect(copiaLuis.leido).toBe(true);
    expect(copiaSofi.leido).toBe(false);
    expect(enviado.leido).toBe(false);
  });

  it("el favorito es independiente por usuario", () => {
    const enviado = servidor.enviar(ana, correo(ana, [luis.contacto, sofi.contacto]));
    const copiaLuis = luis.gestor.correosDe(Bandeja.Entrada)[0];
    const copiaSofi = sofi.gestor.correosDe(Bandeja.Entrada)[0];
    copiaLuis.marcarComoFavorito();
    expect(luis.gestor.favoritos()).toEqual([copiaLuis]);
    expect(sofi.gestor.favoritos()).toEqual([]);
    expect(copiaSofi.favorito).toBe(false);
    expect(enviado.favorito).toBe(false);
  });

  it("enviarse un correo a uno mismo lo deja en Enviados y en Entrada", () => {
    servidor.enviar(ana, correo(ana, [ana.contacto]));
    const enviados = ana.gestor.correosDe(Bandeja.Enviados);
    const recibidos = ana.gestor.correosDe(Bandeja.Entrada);
    expect(enviados).toHaveLength(1);
    expect(recibidos).toHaveLength(1);
    expect(enviados[0].id).not.toBe(recibidos[0].id);
  });

  it("eliminar el correo recibido no afecta al remitente", () => {
    const enviado = servidor.enviar(ana, correo(ana, [luis.contacto]));
    const copia = luis.gestor.correosDe(Bandeja.Entrada)[0];
    luis.gestor.eliminar(copia);
    expect(luis.gestor.correosDe(Bandeja.Eliminados)).toEqual([copia]);
    expect(ana.gestor.correosDe(Bandeja.Enviados)).toEqual([enviado]);
  });

  it("un borrador enviado deja Borradores, queda en Enviados y llega al destinatario", () => {
    const b = ana.gestor.crearBorrador({ remitente: ana.contacto, asunto: "Examen", destinatarios: [luis.contacto] });
    servidor.enviar(ana, b);
    expect(ana.gestor.correosDe(Bandeja.Borradores)).toEqual([]);
    expect(ana.gestor.correosDe(Bandeja.Enviados)).toHaveLength(1);
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
  });

  it("un correo sin asunto válido no se envía ni se entrega", () => {
    expect(() => servidor.enviar(ana, correo(ana, [luis.contacto], ""))).toThrow("asunto");
    expect(ana.gestor.correosDe(Bandeja.Enviados)).toEqual([]);
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toEqual([]);
  });

  it("un correo sin destinatarios no se envía", () => {
    expect(() => servidor.enviar(ana, correo(ana, []))).toThrow("destinatario");
    expect(ana.gestor.correosDe(Bandeja.Enviados)).toEqual([]);
  });

  it("un usuario no puede enviar un correo cuyo remitente es otro", () => {
    const deAna = correo(ana, [sofi.contacto]);
    expect(() => servidor.enviar(luis, deAna)).toThrow("remitente");
    expect(sofi.gestor.correosDe(Bandeja.Entrada)).toEqual([]);
    expect(luis.gestor.correosDe(Bandeja.Enviados)).toEqual([]);
  });

  it("un usuario que no está registrado en el servidor no puede enviar", () => {
    const suelto = new Usuario("Pedro Díaz", "pedro@gmail.com");
    expect(() => servidor.enviar(suelto, correo(suelto, [luis.contacto]))).toThrow("no está registrado");
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toEqual([]);
  });

  it("enviar dos veces el mismo correo falla y no duplica la entrega", () => {
    const c = correo(ana, [luis.contacto]);
    servidor.enviar(ana, c);
    expect(() => servidor.enviar(ana, c)).toThrow("ya fue enviado");
    expect(luis.gestor.correosDe(Bandeja.Entrada)).toHaveLength(1);
  });
});
