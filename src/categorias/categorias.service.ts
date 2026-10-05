import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { MemStoreService } from '../mem-store/mem-store.service';

@Injectable()
export class CategoriasService {
  constructor(private readonly store: MemStoreService) {}

  listarProductos() {
    return [...this.store.categoriasProducto].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es'),
    );
  }

  listarGastos() {
    return [...this.store.categoriasGasto].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es'),
    );
  }

  crearProducto(dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (this.listarProductos().some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      throw new ConflictException('Ya existe una categoría de producto con ese nombre');
    }
    const item = { id: this.store.nextCatProdId(), nombre };
    this.store.categoriasProducto.push(item);
    return item;
  }

  crearGasto(dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (this.listarGastos().some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      throw new ConflictException('Ya existe una categoría de gasto con ese nombre');
    }
    const item = { id: this.store.nextCatGastoId(), nombre };
    this.store.categoriasGasto.push(item);
    return item;
  }

  actualizarProducto(id: number, dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    const item = this.store.categoriasProducto.find((c) => c.id === id);
    if (!item) throw new NotFoundException('Categoría no encontrada');
    if (
      this.listarProductos().some(
        (c) => c.id !== id && c.nombre.toLowerCase() === nombre.toLowerCase(),
      )
    ) {
      throw new ConflictException('Ya existe una categoría de producto con ese nombre');
    }
    item.nombre = nombre;
    return item;
  }

  actualizarGasto(id: number, dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    const item = this.store.categoriasGasto.find((c) => c.id === id);
    if (!item) throw new NotFoundException('Categoría no encontrada');
    if (
      this.listarGastos().some(
        (c) => c.id !== id && c.nombre.toLowerCase() === nombre.toLowerCase(),
      )
    ) {
      throw new ConflictException('Ya existe una categoría de gasto con ese nombre');
    }
    item.nombre = nombre;
    return item;
  }

  eliminarProducto(id: number) {
    const idx = this.store.categoriasProducto.findIndex((c) => c.id === id);
    if (idx < 0) throw new NotFoundException('Categoría no encontrada');
    this.store.categoriasProducto.splice(idx, 1);
  }

  eliminarGasto(id: number) {
    const idx = this.store.categoriasGasto.findIndex((c) => c.id === id);
    if (idx < 0) throw new NotFoundException('Categoría no encontrada');
    this.store.categoriasGasto.splice(idx, 1);
  }

  findProducto(id: number) {
    return this.store.categoriasProducto.find((c) => c.id === id) || null;
  }

  findGasto(id: number) {
    return this.store.categoriasGasto.find((c) => c.id === id) || null;
  }
}
