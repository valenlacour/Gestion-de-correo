import { Contacto } from "../src/models/Contacto";

describe("Contacto", () => {
  it("conserva nombre completo y email", () => {
    const c = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
    expect(c.nombreCompleto).toBe("Ana Pérez");
    expect(c.email).toBe("ana@ucp.edu.ar");
  });

  it("rechaza un nombre vacío", () => {
    expect(() => new Contacto("", "ana@ucp.edu.ar")).toThrow("nombre");
    expect(() => new Contacto("   ", "ana@ucp.edu.ar")).toThrow("nombre");
  });
});
