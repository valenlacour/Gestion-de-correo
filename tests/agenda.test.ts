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

describe("Agenda · modificar y eliminar", () => {
  let agenda: Agenda;

  beforeEach(() => {
    agenda = new Agenda();
  });

  it("modifica el nombre de un contacto existente", () => {
    agenda.agregar("Ana", "ana@ucp.edu.ar");
    const modificado = agenda.modificar("ana@ucp.edu.ar", { nombreCompleto: "Ana María" });
    expect(modificado.nombreCompleto).toBe("Ana María");
    expect(agenda.obtener("ana@ucp.edu.ar")?.nombreCompleto).toBe("Ana María");
  });

  it("modifica la dirección de un contacto y actualiza la búsqueda", () => {
    agenda.agregar("Ana", "ana@ucp.edu.ar");
    agenda.modificar("ana@ucp.edu.ar", { email: "ana.nueva@ucp.edu.ar" });
    expect(agenda.obtener("ana@ucp.edu.ar")).toBeUndefined();
    expect(agenda.obtener("ana.nueva@ucp.edu.ar")).toBeDefined();
  });

  it("no permite cambiar el email a uno que ya usa otro contacto", () => {
    agenda.agregar("Ana", "ana@ucp.edu.ar");
    agenda.agregar("Luis", "luis@ucp.edu.ar");
    expect(() => agenda.modificar("luis@ucp.edu.ar", { email: "ana@ucp.edu.ar" })).toThrow("existe");
  });

  it("falla al modificar un contacto que no existe", () => {
    expect(() => agenda.modificar("nadie@ucp.edu.ar", { nombreCompleto: "X" })).toThrow("No existe");
  });

  it("elimina un contacto de la agenda", () => {
    agenda.agregar("Ana", "ana@ucp.edu.ar");
    expect(agenda.eliminar("ana@ucp.edu.ar")).toBe(true);
    expect(agenda.listar()).toHaveLength(0);
    expect(agenda.obtener("ana@ucp.edu.ar")).toBeUndefined();
  });

  it("eliminar un contacto que no existe devuelve false", () => {
    expect(agenda.eliminar("nadie@ucp.edu.ar")).toBe(false);
  });
});
