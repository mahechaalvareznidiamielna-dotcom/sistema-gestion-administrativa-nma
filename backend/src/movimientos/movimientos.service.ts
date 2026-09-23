import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { Movimiento } from './movimiento.entity';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { ProductosService } from '../productos/productos.service';
import { CategoriasService } from '../categorias/categorias.service';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly repo: Repository<Movimiento>,
    private readonly productos: ProductosService,
    private readonly categorias: CategoriasService,
  ) {}

  async listar(params: {
    q?: string;
    tipo?: string;
    desde?: string;
    hasta?: string;
    categoriaGastoId?: number;
  }) {
    const where: any = {};
    if (params.tipo === 'ingreso' || params.tipo === 'gasto') {
      where.tipo = params.tipo;
    }
    if (params.desde && params.hasta) {
      where.fecha = Between(params.desde, params.hasta);
    }
    if (params.categoriaGastoId) {
      where.categoriaGastoId = params.categoriaGastoId;
    }
    if (params.q?.trim()) {
      where.descripcion = Like(`%${params.q.trim()}%`);
    }
    const items = await this.repo.find({
      where,
      order: { fecha: 'DESC', id: 'DESC' },
    });
    const totalIngresos = items
      .filter((i) => i.tipo === 'ingreso')
      .reduce((s, i) => s + Number(i.valor), 0);
    const totalGastos = items
      .filter((i) => i.tipo === 'gasto')
      .reduce((s, i) => s + Number(i.valor), 0);
    return {
      items,
      totalIngresos,
      totalGastos,
      saldo: totalIngresos - totalGastos,
    };
  }

  recientes(limite = 5) {
    return this.repo.find({
      order: { fecha: 'DESC', id: 'DESC' },
      take: limite,
    });
  }

  async obtener(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Movimiento no encontrado');
    return item;
  }

  async crear(dto: CrearMovimientoDto) {
    const data = await this.preparar(dto);
    if (dto.tipo === 'ingreso' && dto.productoId && dto.cantidad) {
      await this.productos.ajustarStock(dto.productoId, -dto.cantidad);
    }
    return this.repo.save(this.repo.create(data));
  }

  async actualizar(id: number, dto: CrearMovimientoDto) {
    const actual = await this.obtener(id);
    if (actual.tipo === 'ingreso' && actual.productoId && actual.cantidad) {
      await this.productos.ajustarStock(actual.productoId, actual.cantidad);
    }
    try {
      const data = await this.preparar(dto);
      if (dto.tipo === 'ingreso' && dto.productoId && dto.cantidad) {
        await this.productos.ajustarStock(dto.productoId, -dto.cantidad);
      }
      await this.repo.update(id, data);
      return this.obtener(id);
    } catch (error) {
      if (actual.tipo === 'ingreso' && actual.productoId && actual.cantidad) {
        await this.productos.ajustarStock(actual.productoId, -actual.cantidad);
      }
      throw error;
    }
  }

  async eliminar(id: number) {
    const actual = await this.obtener(id);
    if (actual.tipo === 'ingreso' && actual.productoId && actual.cantidad) {
      await this.productos.ajustarStock(actual.productoId, actual.cantidad);
    }
    await this.repo.delete(id);
  }

  private async preparar(dto: CrearMovimientoDto) {
    if (dto.tipo === 'gasto') {
      if (!dto.categoriaGastoId) {
        throw new BadRequestException('El gasto debe tener una categoría');
      }
      const cat = await this.categorias.findGasto(dto.categoriaGastoId);
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
      categoriaGastoId: dto.tipo === 'gasto' ? dto.categoriaGastoId : null,
      productoId: dto.tipo === 'ingreso' ? dto.productoId || null : null,
    };
  }
}
