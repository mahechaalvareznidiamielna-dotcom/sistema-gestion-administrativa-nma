export type PrioridadTarea = 'alta' | 'media' | 'baja';
export type EstadoTarea = 'pendiente' | 'completada';

export interface Tarea {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  fechaLimite: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
}
