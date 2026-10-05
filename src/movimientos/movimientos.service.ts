import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemStoreService, MemMovimiento } from '../mem-store/mem-store.service';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { ProductosService } from '../productos/productos.service';
import { CategoriasService } from '../categorias/categorias.service';
import { CalculosService } from '../calculos/calculos.service';

@Injectable()
export class MovimientosService {
  constructor(
    private readonly store: MemStoreService,
    private readonly productos: ProductosService,
    private readonly categorias: CategoriasService,
    private readonly calculos: CalculosService,
  ) {}

  async listar(params: {
    q?: string; tipo?: string;
    desde?: string; hasta?: string;
    categoriaGastoId?: number;
  }) {
    let lista = [...this.store.movimientos];
    if (params.tipo === 'ingreso' || params.tipo === 'gasto') {
      lista = lista.filter(m => m.tipo === params.tipo);
    }
    if (params.desde && params.hasta) {
      lista = lista.filter(m => m.fecha >= params.desde! && m.fecha <= params.hasta!);
    }
    if (params.categoriaGastoId) {
      lista = lista.filter(m => m.categoriaGastoId === params.categoriaGastoId);
    }
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      lista = lista.filter(m => m.descripcion.toLowerCase().includes(q));
    }
    lista.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

    const items = lista.map(m => this.store.resolveMovimiento(m));
    const { totalIngresos, totalGastos, saldo, margenUtilidad } =
      this.calculos.calcularTotales(items as any);
    return { items, totalIngresos, totalGastos, saldo, margenUtilidad };
  }

  recientes(limite = 5) {
    return [...this.store.movimientos]
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
      .slice(0, limite)
      .map(m => this.store.resolveMovimiento(m));
  }

  async obtener(id: number) {
    const m = this.store.movimientos.find(x => x.id === id);
    if (!m) throw new NotFoundException('Movimiento no encontrado');
    return this.store.resolveMovimiento(m);
  }

  async crear(dto: CrearMovimientoDto) {
    const data = await this.preparar(dto);
    if (dto.tipo === 'ingreso' && dto.productoId && dto.cantidad) {
      const prod = await this.productos.obtener(dto.productoId);
      this.calculos.deducirInventario(prod.cantidadDisponible, dto.cantidad);
      await this.productos.ajustarStock(dto.productoId, -dto.cantidad);
    }
    const nuevo: MemMovimiento = { id: this.store.nextMovimientoId(), ...data };
    this.store.movimientos.push(nuevo);
    return this.store.resolveMovimiento(nuevo);
  }

  async actualizar(id: number, dto: CrearMovimientoDto) {
    const actual = this.store.movimientos.find(x => x.id === id);
    if (!actual) throw new NotFoundException('Movimiento no encontrado');
    if (actual.tipo === 'ingreso' && actual.productoId && actual.cantidad) {
      await this.productos.ajustarStock(actual.productoId, actual.cantidad);
    }
    try {
      const data = await this.preparar(dto);
      if (dto.tipo === 'ingreso' && dto.productoId && dto.cantidad) {
        const prod = await this.productos.obtener(dto.productoId);
        this.calculos.deducirInventario(prod.cantidadDisponible, dto.cantidad);
        await this.productos.ajustarStock(dto.productoId, -dto.cantidad);
      }
      const idx = this.store.movimientos.findIndex(x => x.id === id);
      this.store.movimientos[idx] = { id, ...data };
      return this.store.resolveMovimiento(this.store.movimientos[idx]);
    } catch (error) {
      if (actual.tipo === 'ingreso' && actual.productoId && actual.cantidad) {
        await this.productos.ajustarStock(actual.productoId, -actual.cantidad);
      }
      throw error;
    }
  }

  async eliminar(id: number) {
    const actual = this.store.movimientos.find(x => x.id === id);
    if (!actual) throw new NotFoundException('Movimiento no encontrado');
    if (actual.tipo === 'ingreso' && actual.productoId && actual.cantidad) {
      await this.productos.ajustarStock(actual.productoId, actual.cantidad);
    }
    const idx = this.store.movimientos.findIndex(x => x.id === id);
    this.store.movimientos.splice(idx, 1);
  }

  private async preparar(dto: CrearMovimientoDto) {
    if (dto.tipo === 'gasto') {
      if (!dto.categoriaGastoId) throw new BadRequestException('El gasto debe tener una categoría');
      const cat = this.categorias.findGasto(dto.categoriaGastoId);
      if (!cat) throw new BadRequestException('Categoría de gasto inválida');
    }
    if (dto.tipo === 'ingreso' && dto.productoId) {
      await this.productos.obtener(dto.productoId);
    }
    return {
      tipo: dto.tipo,
      fecha: dto.fecha,
      descripcion: dto.descripcion.trim(),
      valor: dto.valor,
      observacion: dto.observacion?.trim() || '',
      formaPago: dto.tipo === 'ingreso' ? dto.formaPago || 'efectivo' : null,
      cantidad: dto.tipo === 'ingreso' ? dto.cantidad || null : null,
      categoriaGastoId: dto.tipo === 'gasto' ? dto.categoriaGastoId ?? null : null,
      productoId: dto.tipo === 'ingreso' ? dto.productoId || null : null,
    };
  }
}
