import { favoritos } from "../src/services/consultas";
import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";
import { Correo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const luis = new Contacto("Luis Gómez", "luis@gmail.com");
const nuevo = (asunto: string) => new Correo({ remitente: luis, asunto, destinatarios: [ana] });

describe("RF-09 · Marcar y desmarcar favoritos", () => {
  it("un correo se puede marcar como favorito", () => {
    const c = nuevo("A");
    c.marcarComoFavorito();
    expect(c.favorito).toBe(true);
  });

  it("un correo se puede desmarcar como favorito", () => {
    const c = nuevo("A");
    c.marcarComoFavorito();
    c.quitarFavorito();
    expect(c.favorito).toBe(false);
  });

  it("marcar dos veces no cambia el estado", () => {
    const c = nuevo("A");
    c.marcarComoFavorito();
    c.marcarComoFavorito();
    expect(c.favorito).toBe(true);
  });

  it("el favorito de un correo no afecta a otro", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    a.marcarComoFavorito();
    expect(b.favorito).toBe(false);
  });

  it("marcar favorito no cambia el estado de lectura", () => {
    const c = nuevo("A");
    c.marcarComoFavorito();
    expect(c.leido).toBe(false);
  });
});

describe("RF-09 · función favoritos", () => {
  it("devuelve solo los favoritos, en el mismo orden", () => {
    const a = nuevo("A");
    const b = nuevo("B");
    const c = nuevo("C");
    a.marcarComoFavorito();
    c.marcarComoFavorito();
    expect(favoritos([a, b, c])).toEqual([a, c]);
  });

  it("con una lista vacía o sin favoritos devuelve una lista vacía", () => {
    expect(favoritos([])).toEqual([]);
    expect(favoritos([nuevo("A")])).toEqual([]);
  });

  it("refleja los cambios sin guardar nada y no modifica la lista original", () => {
    const a = nuevo("A");
    const original = [a];
    expect(favoritos(original)).toEqual([]);
    a.marcarComoFavorito();
    expect(favoritos(original)).toEqual([a]);
    a.quitarFavorito();
    expect(favoritos(original)).toEqual([]);
    expect(original).toEqual([a]);
  });
});

describe("RF-09 · vista de favoritos del gestor", () => {
  let gestor: GestorCorreos;

  beforeEach(() => {
    gestor = new GestorCorreos();
  });

  it("reúne los favoritos de todas las bandejas, sin importar la original", () => {
    const entrada = nuevo("Entrada");
    const borrador = gestor.crearBorrador({ remitente: ana, asunto: "Borrador", destinatarios: [luis] });
    const enviado = gestor.enviar(new Correo({ remitente: ana, asunto: "Enviado", destinatarios: [luis] }));
    gestor.recibir(entrada);
    entrada.marcarComoFavorito();
    borrador.marcarComoFavorito();
    enviado.marcarComoFavorito();
    expect(gestor.favoritos()).toHaveLength(3);
  });

  it("marcar un correo como favorito no lo mueve de su bandeja", () => {
    const c = nuevo("A");
    gestor.recibir(c);
    c.marcarComoFavorito();
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Entrada);
    expect(gestor.correosDe(Bandeja.Entrada)).toEqual([c]);
  });

  it("no hay duplicados al consultar favoritos", () => {
    const c = nuevo("A");
    gestor.recibir(c);
    c.marcarComoFavorito();
    const ids = gestor.favoritos().map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(1);
  });

  it("los correos eliminados no aparecen en favoritos y conservan el indicador", () => {
    const c = nuevo("A");
    gestor.recibir(c);
    c.marcarComoFavorito();
    gestor.eliminar(c);
    expect(gestor.favoritos()).toEqual([]);
    expect(gestor.bandejaDe(c)).toBe(Bandeja.Eliminados);
    expect(c.favorito).toBe(true);
  });

  it("al restaurar un correo eliminado vuelve a aparecer en favoritos", () => {
    const c = nuevo("A");
    gestor.recibir(c);
    c.marcarComoFavorito();
    gestor.eliminar(c);
    gestor.restaurar(c);
    expect(gestor.favoritos()).toEqual([c]);
  });

  it("al desmarcar un favorito deja de aparecer", () => {
    const c = nuevo("A");
    gestor.recibir(c);
    c.marcarComoFavorito();
    c.quitarFavorito();
    expect(gestor.favoritos()).toEqual([]);
  });

  it("un borrador favorito conserva el indicador al editarlo", () => {
    const b = gestor.crearBorrador({ remitente: ana, asunto: "Hola" });
    b.marcarComoFavorito();
    const editado = gestor.editarBorrador(b, { asunto: "Hola editado" });
    expect(editado.favorito).toBe(true);
    expect(gestor.favoritos()).toEqual([editado]);
  });
});
