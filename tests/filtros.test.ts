import { RegistroFiltros, MAX_FILTROS } from "../src/services/filtros";
import { and, not, leido, asuntoContiene, remitenteDeDominio } from "../src/services/predicados";
import { Correo, DatosCorreo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (datos: Partial<DatosCorreo> = {}) =>
  new Correo({ remitente: luis, destinatarios: [ana], ...datos });

describe("RF-05 · registro de filtros", () => {
  let registro: RegistroFiltros;

  beforeEach(() => {
    registro = new RegistroFiltros();
  });

  it("el máximo de filtros es 5", () => {
    expect(MAX_FILTROS).toBe(5);
  });

  it("empieza sin filtros", () => {
    expect(registro.listar()).toEqual([]);
  });

  it("registra un filtro con nombre y predicado, y se puede obtener por nombre", () => {
    const filtro = registro.registrar("Sin leer", not(leido));
    expect(filtro.nombre).toBe("Sin leer");
    expect(registro.obtener("Sin leer")).toBe(filtro);
    expect(registro.listar()).toEqual([filtro]);
  });

  it("obtener un nombre inexistente devuelve undefined", () => {
    expect(registro.obtener("No existe")).toBeUndefined();
  });

  it("la búsqueda por nombre no distingue mayúsculas ni espacios de los bordes", () => {
    const filtro = registro.registrar("Sin leer", not(leido));
    expect(registro.obtener("  sin LEER ")).toBe(filtro);
  });

  it("rechaza un nombre vacío o de solo espacios", () => {
    expect(() => registro.registrar("", not(leido))).toThrow();
    expect(() => registro.registrar("   ", not(leido))).toThrow();
    expect(registro.listar()).toEqual([]);
  });

  it("rechaza un nombre repetido, sin distinguir mayúsculas", () => {
    registro.registrar("Sin leer", not(leido));
    expect(() => registro.registrar("sin leer", leido)).toThrow();
    expect(registro.listar()).toHaveLength(1);
  });

  it("permite registrar hasta cinco filtros", () => {
    for (let i = 1; i <= MAX_FILTROS; i++) {
      registro.registrar(`Filtro ${i}`, leido);
    }
    expect(registro.listar()).toHaveLength(5);
  });

  it("impide registrar más de cinco filtros y no agrega el sexto", () => {
    for (let i = 1; i <= MAX_FILTROS; i++) {
      registro.registrar(`Filtro ${i}`, leido);
    }
    expect(() => registro.registrar("Filtro 6", leido)).toThrow();
    expect(registro.listar()).toHaveLength(5);
    expect(registro.obtener("Filtro 6")).toBeUndefined();
  });

  it("listar devuelve una copia: no expone la colección interna", () => {
    registro.registrar("Sin leer", not(leido));
    (registro.listar() as unknown[]).pop();
    expect(registro.listar()).toHaveLength(1);
  });

  it("aplicar devuelve los correos que cumplen la condición, en el mismo orden", () => {
    registro.registrar("Exámenes", asuntoContiene("examen"));
    const a = nuevo({ asunto: "Examen 1" });
    const b = nuevo({ asunto: "Reunión" });
    const c = nuevo({ asunto: "Examen 2" });
    expect(registro.aplicar("Exámenes", [a, b, c])).toEqual([a, c]);
  });

  it("aplicar con una colección vacía devuelve una colección vacía", () => {
    registro.registrar("Exámenes", asuntoContiene("examen"));
    expect(registro.aplicar("Exámenes", [])).toEqual([]);
  });

  it("aplicar un filtro que no existe lanza un error", () => {
    expect(() => registro.aplicar("No existe", [nuevo()])).toThrow();
  });

  it("un mismo filtro se puede aplicar a distintas colecciones", () => {
    registro.registrar("Sin leer", not(leido));
    const a = nuevo();
    const b = nuevo();
    b.marcarComoLeido();
    const otra = nuevo();
    expect(registro.aplicar("Sin leer", [a, b])).toEqual([a]);
    expect(registro.aplicar("Sin leer", [b, otra])).toEqual([otra]);
  });

  it("los cambios en los correos se reflejan sin volver a registrar nada", () => {
    registro.registrar("Sin leer", not(leido));
    const a = nuevo();
    expect(registro.aplicar("Sin leer", [a])).toEqual([a]);
    a.marcarComoLeido();
    expect(registro.aplicar("Sin leer", [a])).toEqual([]);
    a.marcarComoNoLeido();
    expect(registro.aplicar("Sin leer", [a])).toEqual([a]);
  });

  it("aplicar no modifica la colección original ni los correos", () => {
    registro.registrar("Exámenes", asuntoContiene("examen"));
    const a = nuevo({ asunto: "Examen" });
    const b = nuevo({ asunto: "Otro" });
    const original = [a, b];
    const resultado = registro.aplicar("Exámenes", original);
    expect(original).toEqual([a, b]);
    expect(resultado).not.toBe(original);
    expect(a.leido).toBe(false);
    expect(a.favorito).toBe(false);
    expect(a.asunto).toBe("Examen");
  });

  it("un filtro puede construirse reutilizando predicados existentes", () => {
    const deUcp = remitenteDeDominio("@ucp.edu.ar");
    registro.registrar("De la UCP", deUcp);
    registro.registrar("Académicos sin leer", and(deUcp, asuntoContiene("examen"), not(leido)));
    const a = nuevo({ remitente: ana, asunto: "Examen final" });
    const b = nuevo({ remitente: ana, asunto: "Aviso" });
    const c = nuevo({ remitente: luis, asunto: "Examen" });
    expect(registro.aplicar("De la UCP", [a, b, c])).toEqual([a, b]);
    expect(registro.aplicar("Académicos sin leer", [a, b, c])).toEqual([a]);
  });
});
