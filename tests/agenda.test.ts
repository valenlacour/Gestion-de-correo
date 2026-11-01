import { Agenda } from "../src/services/Agenda";

describe("Agenda de contactos", () => {
  let agenda: Agenda;

  beforeEach(() => {
    agenda = new Agenda();
  });

  it("empieza vacía", () => {
    expect(agenda.listar()).toEqual([]);
  });

  it("agrega un contacto y lo consulta por email, sin distinguir mayúsculas", () => {
    const ana = agenda.agregar("Ana Pérez", "ana@ucp.edu.ar");
    expect(agenda.obtener("ANA@ucp.edu.ar")).toBe(ana);
    expect(agenda.listar()).toHaveLength(1);
  });

  it("devuelve undefined al consultar un contacto que no existe", () => {
    expect(agenda.obtener("nadie@ucp.edu.ar")).toBeUndefined();
  });

  it("impide contactos duplicados por dirección de correo", () => {
    agenda.agregar("Ana", "ana@ucp.edu.ar");
    expect(() => agenda.agregar("Otra Ana", "ANA@ucp.edu.ar")).toThrow("existe");
    expect(agenda.listar()).toHaveLength(1);
  });

  it("valida el formato del email al agregar", () => {
    expect(() => agenda.agregar("Ana", "no-es-un-mail")).toThrow("formato");
    expect(agenda.listar()).toHaveLength(0);
  });
});
