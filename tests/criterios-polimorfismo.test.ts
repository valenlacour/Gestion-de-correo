import { CriterioSimple } from "../src/services/criterios/CriterioSimple";
import { CriterioY } from "../src/services/criterios/CriterioY";
import { CriterioO } from "../src/services/criterios/CriterioO";
import { CriterioNo } from "../src/services/criterios/CriterioNo";
import { CriterioFiltro } from "../src/services/criterios/CriterioFiltro";
import { Filtro, MAX_FILTROS, RegistroFiltros } from "../src/services/filtros";
import {
  asuntoContiene,
  cuerpoContiene,
  favorito,
  leido,
  remitenteDeDominio,
  remitenteEs,
} from "../src/services/predicados";
import { Correo, DatosCorreo } from "../src/models/Correo";
import { Contacto } from "../src/models/Contacto";
import { GestorCorreos } from "../src/services/GestorCorreos";
import { Bandeja } from "../src/models/Bandeja";

const profe = new Contacto("Prof Gómez", "gomez@ucp.edu.ar");
const amigo = new Contacto("Mateo", "mateo@gmail.com");
const yo = new Contacto("Camilo", "camilo@gmail.com");

const nuevo = (datos: Partial<DatosCorreo> = {}) =>
  new Correo({ remitente: profe, destinatarios: [yo], ...datos });

const crearFiltros = (contacto: Contacto): CriterioFiltro[] => {
  const ucp = new CriterioSimple("Correos UCP", remitenteDeDominio("@ucp.edu.ar"));
  const examen = new CriterioSimple("Asunto Examen", asuntoContiene("Examen"));
  const sinLeer = new CriterioNo("Sin leer", new CriterioSimple("Leído", leido));
  const entrega = new CriterioSimple("Cuerpo Entrega", cuerpoContiene("Entrega"));
  const fav = new CriterioSimple("Favorito", favorito);
  return [
    ucp,
    new CriterioY("Académicos", [ucp, examen]),
    new CriterioY("Pendientes", [sinLeer, entrega]),
    new CriterioO("Personales", [new CriterioSimple("Del contacto", remitenteEs(contacto.email)), fav]),
    new CriterioY("Seguimiento", [fav, sinLeer]),
  ];
};

describe("RF-05 · polimorfismo de criterios", () => {
  let c1: Correo;
  let c2: Correo;
  let c3: Correo;
  let c4: Correo;
  let c5: Correo;
  let todos: Correo[];

  beforeEach(() => {
    c1 = nuevo({ asunto: "Examen final", cuerpo: "Entrega del TP el lunes" });
    c2 = nuevo({ asunto: "Aviso de cursada", cuerpo: "Sin novedades" });
    c2.marcarComoLeido();
    c3 = nuevo({ remitente: amigo, asunto: "Proyecto pendiente", cuerpo: "Revisar" });
    c3.marcarComoFavorito();
    c4 = nuevo({ remitente: amigo, asunto: "Fotos", cuerpo: "Mirá" });
    c4.marcarComoLeido();
    c5 = nuevo({ remitente: yo, asunto: "Nota personal", cuerpo: "Recordar" });
    todos = [c1, c2, c3, c4, c5];
  });

  it("una lista Filtro[] mezcla subclases y se usa de la misma forma", () => {
    const filtros: Filtro[] = crearFiltros(amigo);
    const resultados = filtros.map((f) => todos.filter(f.predicado).length);
    expect(resultados).toEqual([2, 1, 2, 2, 1]);
  });

  it("aplicar es polimórfico: cada subclase resuelve su propio predicado", () => {
    const [ucp, academicos, pendientes, personales, seguimiento] = crearFiltros(amigo);
    expect(ucp.aplicar(todos)).toEqual([c1, c2]);
    expect(academicos.aplicar(todos)).toEqual([c1]);
    expect(pendientes.aplicar(todos)).toEqual([c1]);
    expect(personales.aplicar(todos)).toEqual([c3, c4]);
    expect(seguimiento.aplicar(todos)).toEqual([c3]);
  });

  it("todos los criterios son CriterioFiltro", () => {
    for (const criterio of crearFiltros(amigo)) {
      expect(criterio).toBeInstanceOf(CriterioFiltro);
    }
  });

  it("se registran en RegistroFiltros y se aplican por nombre", () => {
    const registro = new RegistroFiltros();
    for (const criterio of crearFiltros(amigo)) {
      registro.registrar(criterio.nombre, criterio.predicado);
    }
    expect(registro.listar()).toHaveLength(MAX_FILTROS);
    expect(registro.aplicar("Seguimiento", todos)).toEqual([c3]);
    expect(() => registro.registrar("Sexto", leido)).toThrow();
  });

  it("se reutilizan sobre las bandejas del gestor", () => {
    const gestor = new GestorCorreos();
    gestor.recibir(c1);
    gestor.recibir(c2);
    const borrador = gestor.crearBorrador({ remitente: yo, asunto: "Examen pendiente", destinatarios: [profe] });
    gestor.enviar(borrador);
    const examen = new CriterioSimple("Asunto Examen", asuntoContiene("Examen"));
    expect(examen.aplicar(gestor.correosDe(Bandeja.Entrada))).toEqual([c1]);
    expect(examen.aplicar(gestor.correosDe(Bandeja.Enviados)).map((c) => c.id)).toEqual([borrador.id]);
  });

  it("no modifica la colección original", () => {
    const copia = [...todos];
    for (const criterio of crearFiltros(amigo)) {
      criterio.aplicar(todos);
    }
    expect(todos).toEqual(copia);
  });

  it("refleja los cambios de estado de los correos", () => {
    const seguimiento = crearFiltros(amigo)[4];
    c3.marcarComoLeido();
    expect(seguimiento.aplicar(todos)).toEqual([]);
    c4.marcarComoFavorito();
    c4.marcarComoNoLeido();
    expect(seguimiento.aplicar(todos)).toEqual([c4]);
  });
});
