import { CategoriaProducto } from '../categorias/categoria-producto.entity';

export interface Producto {
  id: number;
  nombre: string;
  categoriaId: number;
  cantidadDisponible: number;
  precioCompra: number;
  precioVenta: number;
  ubicacion: string;
  observaciones: string;
  categoria?: CategoriaProducto;
}
