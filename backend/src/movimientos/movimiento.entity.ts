import { CategoriaGasto } from '../categorias/categoria-gasto.entity';
import { Producto } from '../productos/producto.entity';

export type TipoMovimiento = 'ingreso' | 'gasto';

export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  fecha: string;
  descripcion: string;
  valor: number;
  observacion: string;
  formaPago: string | null;
  cantidad: number | null;
  categoriaGastoId: number | null;
  productoId: number | null;
  categoriaGasto?: CategoriaGasto | null;
  producto?: Producto | null;
}
