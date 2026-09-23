import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type PrioridadTarea = 'alta' | 'media' | 'baja';
export type EstadoTarea = 'pendiente' | 'completada';

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', default: '' })
  descripcion: string;

  @Column({ type: 'text' })
  fecha: string;

  @Column({ type: 'text' })
  fechaLimite: string;

  @Column({ type: 'text', default: 'media' })
  prioridad: PrioridadTarea;

  @Column({ type: 'text', default: 'pendiente' })
  estado: EstadoTarea;
}
