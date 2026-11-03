import { Agenda } from "../src/services/Agenda";
import { Correo } from "../src/models/Correo";

describe("RF-03 · Eliminar contactos no afecta el historial", () => {
  it("eliminar un contacto de la agenda NO elimina los correos que lo referencian", () => {
    const agenda = new Agenda();
    const ana = agenda.agregar("Ana", "ana@ucp.edu.ar");
    const luis = agenda.agregar("Luis", "luis@ucp.edu.ar");
    const correo = new Correo({ asunto: "Hola", cuerpo: "Texto", remitente: ana, destinatarios: [luis] });

    agenda.eliminar("ana@ucp.edu.ar");
    agenda.eliminar("luis@ucp.edu.ar");

    expect(agenda.listar()).toHaveLength(0);
    expect(correo.remitente.email).toBe("ana@ucp.edu.ar");
    expect(correo.remitente.nombreCompleto).toBe("Ana");
    expect(correo.destinatarios).toHaveLength(1);
    expect(correo.destinatarios[0].email).toBe("luis@ucp.edu.ar");
  });

  it("modificar un contacto de la agenda no cambia los datos de los correos viejos", () => {
    const agenda = new Agenda();
    const ana = agenda.agregar("Ana", "ana@ucp.edu.ar");
    const correo = new Correo({ asunto: "Hola", remitente: ana });

    agenda.modificar("ana@ucp.edu.ar", { nombreCompleto: "Ana María" });

    expect(correo.remitente.nombreCompleto).toBe("Ana");
  });
});
