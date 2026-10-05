import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemStoreService, MemProducto } from '../mem-store/mem-store.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { CategoriasService } from '../categorias/categorias.service';
import { CalculosService } from '../calculos/calculos.service';

@Injectable()
export class ProductosService {
  constructor(
    private readonly store: MemStoreService,
    private readonly categorias: CategoriasService,
    private readonly calculos: CalculosService,
  ) {}

  listar(busqueda?: string) {
    let lista = this.store.productos;
    if (busqueda?.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(p => p.nombre.toLowerCase().includes(q));
    }
    return [...lista]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map(p => this.store.resolveProducto(p));
  }

  async metricas() {
    const productos = this.store.productos.map(p => this.store.resolveProducto(p));
    return this.calculos.calcularMetricasInventario(productos as any);
  }

  async obtener(id: number) {
    const p = this.store.productos.find(x => x.id === id);
    if (!p) throw new NotFoundException('Producto no encontrado');
    return this.store.resolveProducto(p);
  }

  async crear(dto: CrearProductoDto) {
    const categoria = this.categorias.findProducto(dto.categoriaId);
    if (!categoria) throw new BadRequestException('Categoría de producto inválida');
    const nuevo: MemProducto = {
      id: this.store.nextProductoId(),
      nombre: dto.nombre,
      categoriaId: dto.categoriaId,
      cantidadDisponible: dto.cantidadDisponible ?? 0,
      precioCompra: dto.precioCompra ?? 0,
      precioVenta: dto.precioVenta ?? 0,
      ubicacion: dto.ubicacion?.trim() || '',
      observaciones: dto.observaciones?.trim() || '',
    };
    this.store.productos.push(nuevo);
    return this.store.resolveProducto(nuevo);
  }

  async actualizar(id: number, dto: CrearProductoDto) {
    const idx = this.store.productos.findIndex(x => x.id === id);
    if (idx < 0) throw new NotFoundException('Producto no encontrado');
    const categoria = this.categorias.findProducto(dto.categoriaId);
    if (!categoria) throw new BadRequestException('Categoría de producto inválida');
    this.store.productos[idx] = {
      ...this.store.productos[idx],
      ...dto,
      ubicacion: dto.ubicacion?.trim() || '',
      observaciones: dto.observaciones?.trim() || '',
    };
    return this.store.resolveProducto(this.store.productos[idx]);
  }

  async eliminar(id: number) {
    const idx = this.store.productos.findIndex(x => x.id === id);
    if (idx < 0) throw new NotFoundException('Producto no encontrado');
    this.store.productos.splice(idx, 1);
  }

  async ajustarStock(id: number, delta: number) {
    const p = this.store.productos.find(x => x.id === id);
    if (!p) throw new NotFoundException('Producto no encontrado');
    const nueva = p.cantidadDisponible + delta;
    if (nueva < 0) {
      throw new BadRequestException(
        `No hay suficiente existencia de ${p.nombre}. Disponible: ${p.cantidadDisponible}`,
      );
    }
    p.cantidadDisponible = nueva;
    return this.store.resolveProducto(p);
  }
}
