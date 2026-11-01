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

  it("rechaza un email vacío", () => {
    expect(() => new Contacto("Ana", "")).toThrow("correo");
    expect(() => new Contacto("Ana", "   ")).toThrow("correo");
  });

  it.each(["sin-arroba", "a@", "@dominio.com", "a@dominio", "a b@dominio.com", "a@@dominio.com"])(
    "rechaza el formato de email inválido: %s",
    (mail) => {
      expect(() => new Contacto("Ana", mail)).toThrow("formato");
    }
  );

  it.each(["ana@ucp.edu.ar", "a.b-c_d+tag@sub.dominio.com", "x@y.io"])(
    "acepta el formato de email válido: %s",
    (mail) => {
      expect(() => new Contacto("Ana", mail)).not.toThrow();
    }
  );
});
