import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categorias_gasto')
export class CategoriaGasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nombre: string;
}
