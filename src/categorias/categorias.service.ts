import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaProducto } from './categoria-producto.entity';
import { CategoriaGasto } from './categoria-gasto.entity';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { CsvStore, FILES, HEADERS } from '../csv/csv.store';

@Injectable()
export class CategoriasService {
  constructor(private readonly csv: CsvStore) {}

  listarProductos() {
    return this.csv
      .read<CategoriaProducto>(FILES.categoriasProducto)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  listarGastos() {
    return this.csv
      .read<CategoriaGasto>(FILES.categoriasGasto)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  crearProducto(dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (this.listarProductos().some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      throw new ConflictException('Ya existe una categoría de producto con ese nombre');
    }
    return this.csv.insert<CategoriaProducto>(FILES.categoriasProducto, HEADERS.categoriasProducto, {
      nombre,
    });
  }

  crearGasto(dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (this.listarGastos().some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      throw new ConflictException('Ya existe una categoría de gasto con ese nombre');
    }
    return this.csv.insert<CategoriaGasto>(FILES.categoriasGasto, HEADERS.categoriasGasto, {
      nombre,
    });
  }

  actualizarProducto(id: number, dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (
      this.listarProductos().some(
        (c) => c.id !== id && c.nombre.toLowerCase() === nombre.toLowerCase(),
      )
    ) {
      throw new ConflictException('Ya existe una categoría de producto con ese nombre');
    }
    const item = this.csv.update<CategoriaProducto>(
      FILES.categoriasProducto,
      HEADERS.categoriasProducto,
      id,
      { nombre },
    );
    if (!item) throw new NotFoundException('Categoría no encontrada');
    return item;
  }

  actualizarGasto(id: number, dto: CrearCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (
      this.listarGastos().some(
        (c) => c.id !== id && c.nombre.toLowerCase() === nombre.toLowerCase(),
      )
    ) {
      throw new ConflictException('Ya existe una categoría de gasto con ese nombre');
    }
    const item = this.csv.update<CategoriaGasto>(
      FILES.categoriasGasto,
      HEADERS.categoriasGasto,
      id,
      { nombre },
    );
    if (!item) throw new NotFoundException('Categoría no encontrada');
    return item;
  }

  eliminarProducto(id: number) {
    if (!this.csv.remove(FILES.categoriasProducto, HEADERS.categoriasProducto, id)) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }

  eliminarGasto(id: number) {
    if (!this.csv.remove(FILES.categoriasGasto, HEADERS.categoriasGasto, id)) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }

  findProducto(id: number) {
    return this.csv.read<CategoriaProducto>(FILES.categoriasProducto).find((c) => c.id === id) || null;
  }

  findGasto(id: number) {
    return this.csv.read<CategoriaGasto>(FILES.categoriasGasto).find((c) => c.id === id) || null;
  }
}
