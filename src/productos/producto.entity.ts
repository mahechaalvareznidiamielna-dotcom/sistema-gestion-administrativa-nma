import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CategoriaProducto } from '../categorias/categoria-producto.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'integer' })
  categoriaId: number;

  @Column({ type: 'integer', default: 0 })
  cantidadDisponible: number;

  @Column({ type: 'numeric', default: 0 })
  precioCompra: number;

  @Column({ type: 'numeric', default: 0 })
  precioVenta: number;

  @Column({ type: 'text', default: '' })
  ubicacion: string;

  @Column({ type: 'text', default: '' })
  observaciones: string;

  @ManyToOne(() => CategoriaProducto, { eager: true, nullable: true })
  @JoinColumn({ name: 'categoriaId' })
  categoria?: CategoriaProducto;
}
