import { asuntos } from "../src/services/estadisticas";
import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

describe("RF-10 · asuntos de una bandeja", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("devuelve vacío en una bandeja sin correos", () => {
    expect(asuntos(gestor.correosDe(Bandeja.Entrada))).toEqual([]);
  });

  it("devuelve los asuntos de la bandeja de entrada", () => {
    gestor.recibir(nuevo("Examen final"));
    gestor.recibir(nuevo("Fotos"));
    expect(asuntos(gestor.correosDe(Bandeja.Entrada))).toEqual(["Examen final", "Fotos"]);
  });

  it("solo incluye los asuntos de la bandeja pedida", () => {
    gestor.recibir(nuevo("Recibido"));
    gestor.crearBorrador({ remitente: ana, asunto: "Borrador", destinatarios: [luis] });
    expect(asuntos(gestor.correosDe(Bandeja.Entrada))).toEqual(["Recibido"]);
    expect(asuntos(gestor.correosDe(Bandeja.Borradores))).toEqual(["Borrador"]);
  });

  it("refleja los correos que se envían o se eliminan", () => {
    const borrador = gestor.crearBorrador({ remitente: ana, asunto: "Para enviar", destinatarios: [luis] });
    gestor.enviar(borrador);
    const recibido = nuevo("Para eliminar");
    gestor.recibir(recibido);
    gestor.eliminar(recibido);
    expect(asuntos(gestor.correosDe(Bandeja.Enviados))).toEqual(["Para enviar"]);
    expect(asuntos(gestor.correosDe(Bandeja.Entrada))).toEqual([]);
    expect(asuntos(gestor.correosDe(Bandeja.Eliminados))).toEqual(["Para eliminar"]);
  });
});
