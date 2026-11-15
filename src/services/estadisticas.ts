import { Correo } from "../models/Correo";

export const asuntos = (correos: ReadonlyArray<Correo>): string[] =>
  correos.map((correo) => correo.asunto);
