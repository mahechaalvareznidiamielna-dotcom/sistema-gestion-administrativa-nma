import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoriaGasto } from '../categorias/categoria-gasto.entity';
import { Producto } from '../productos/producto.entity';

export type TipoMovimiento = 'ingreso' | 'gasto';

@Entity('movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  tipo: TipoMovimiento;

  @Column({ type: 'text' })
  fecha: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'numeric', default: 0 })
  valor: number;

  @Column({ type: 'text', default: '' })
  observacion: string;

  @Column({ type: 'text', nullable: true })
  formaPago: string | null;

  @Column({ type: 'integer', nullable: true })
  cantidad: number | null;

  @Column({ type: 'integer', nullable: true })
  categoriaGastoId: number | null;

  @Column({ type: 'integer', nullable: true })
  productoId: number | null;

  @ManyToOne(() => CategoriaGasto, { eager: true, nullable: true })
  @JoinColumn({ name: 'categoriaGastoId' })
  categoriaGasto?: CategoriaGasto | null;

  @ManyToOne(() => Producto, { eager: true, nullable: true })
  @JoinColumn({ name: 'productoId' })
  producto?: Producto | null;
}
