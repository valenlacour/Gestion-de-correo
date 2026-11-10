import { buscar } from "../src/services/consultas";
import { GestorCorreos } from "../src/services/GestorCorreos";
import { Correo, DatosCorreo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const sofi = new Contacto("Sofía Ruiz", "sofia@ucp.edu.ar");

const nuevo = (datos: Partial<DatosCorreo> = {}) =>
  new Correo({ remitente: luis, destinatarios: [ana], ...datos });

describe("RF-04 · buscar en una colección", () => {
  it("encuentra por asunto", () => {
    const a = nuevo({ asunto: "Examen final" });
    const b = nuevo({ asunto: "Reunión" });
    expect(buscar([a, b], "examen")).toEqual([a]);
  });

  it("encuentra por contenido del mensaje", () => {
    const a = nuevo({ asunto: "Aviso", cuerpo: "Entrega del proyecto el lunes" });
    const b = nuevo({ asunto: "Otro", cuerpo: "Nada" });
    expect(buscar([a, b], "proyecto")).toEqual([a]);
  });

  it("encuentra por nombre del remitente", () => {
    const a = nuevo({ remitente: sofi });
    const b = nuevo();
    expect(buscar([a, b], "sofía")).toEqual([a]);
  });

  it("encuentra por email del remitente", () => {
    const a = nuevo({ remitente: sofi });
    const b = nuevo();
    expect(buscar([a, b], "sofia@ucp")).toEqual([a]);
  });

  it("encuentra por nombre de cualquiera de los destinatarios", () => {
    const a = nuevo({ destinatarios: [ana, sofi] });
    const b = nuevo({ destinatarios: [ana] });
    expect(buscar([a, b], "ruiz")).toEqual([a]);
  });

  it("encuentra por email de cualquiera de los destinatarios", () => {
    const a = nuevo({ remitente: ana, destinatarios: [luis, sofi] });
    const b = nuevo({ remitente: ana, destinatarios: [luis] });
    expect(buscar([a, b], "sofia@")).toEqual([a]);
  });

  it("no distingue mayúsculas de minúsculas", () => {
    const a = nuevo({ asunto: "Examen final" });
    expect(buscar([a], "EXAMEN")).toEqual([a]);
    expect(buscar([a], "eXaMeN")).toEqual([a]);
  });

  it("admite coincidencias parciales", () => {
    const a = nuevo({ asunto: "Examen final" });
    expect(buscar([a], "exa")).toEqual([a]);
    expect(buscar([a], "nal")).toEqual([a]);
  });

  it("ignora los espacios al principio y al final del texto buscado", () => {
    const a = nuevo({ asunto: "Examen final" });
    expect(buscar([a], "  examen  ")).toEqual([a]);
  });

  it("un correo aparece una sola vez aunque coincida en varios campos", () => {
    const a = nuevo({ asunto: "Ana", cuerpo: "Hola Ana", remitente: ana, destinatarios: [ana] });
    expect(buscar([a], "ana")).toEqual([a]);
    expect(buscar([a], "ana")).toHaveLength(1);
  });

  it("mantiene el orden original de los correos", () => {
    const a = nuevo({ asunto: "Examen 1" });
    const b = nuevo({ asunto: "Otro" });
    const c = nuevo({ asunto: "Examen 2" });
    expect(buscar([a, b, c], "examen")).toEqual([a, c]);
  });

  it("devuelve una colección vacía cuando no hay coincidencias", () => {
    const a = nuevo({ asunto: "Examen" });
    expect(buscar([a], "inexistente")).toEqual([]);
  });

  it("devuelve una colección vacía con una lista vacía", () => {
    expect(buscar([], "examen")).toEqual([]);
  });

  it("un texto vacío o de solo espacios no devuelve correos", () => {
    const a = nuevo({ asunto: "Examen" });
    expect(buscar([a], "")).toEqual([]);
    expect(buscar([a], "   ")).toEqual([]);
  });

  it("no modifica los correos ni la lista original", () => {
    const a = nuevo({ asunto: "Examen", cuerpo: "Texto" });
    const original = [a];
    const resultado = buscar(original, "examen");
    expect(original).toEqual([a]);
    expect(resultado).not.toBe(original);
    expect(a.asunto).toBe("Examen");
    expect(a.cuerpo).toBe("Texto");
    expect(a.destinatarios).toEqual([ana]);
  });
});

describe("RF-04 · búsqueda en la Bandeja de Entrada del gestor", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("busca solo en la Bandeja de Entrada", () => {
    const entrada = nuevo({ asunto: "Examen" });
    gestor.recibir(entrada);
    gestor.crearBorrador({ remitente: ana, asunto: "Examen", destinatarios: [luis] });
    gestor.enviar(new Correo({ remitente: ana, asunto: "Examen", destinatarios: [luis] }));
    expect(gestor.buscar("examen")).toEqual([entrada]);
  });

  it("devuelve una colección vacía con la bandeja vacía", () => {
    expect(gestor.buscar("examen")).toEqual([]);
  });

  it("un correo eliminado deja de aparecer en la búsqueda", () => {
    const c = nuevo({ asunto: "Examen" });
    gestor.recibir(c);
    gestor.eliminar(c);
    expect(gestor.buscar("examen")).toEqual([]);
  });

  it("la búsqueda no cambia la bandeja ni el estado de los correos", () => {
    const c = nuevo({ asunto: "Examen" });
    gestor.recibir(c);
    gestor.buscar("examen");
    expect(gestor.correosDe("Entrada" as never)).toEqual([c]);
    expect(c.leido).toBe(false);
  });

  it("se puede combinar con los favoritos para buscar dentro de ellos", () => {
    const a = nuevo({ asunto: "Examen de álgebra" });
    const b = nuevo({ asunto: "Examen de física" });
    const c = nuevo({ asunto: "Reunión" });
    gestor.recibir(a);
    gestor.recibir(b);
    gestor.recibir(c);
    a.marcarComoFavorito();
    c.marcarComoFavorito();
    expect(buscar(gestor.favoritos(), "examen")).toEqual([a]);
  });
});
