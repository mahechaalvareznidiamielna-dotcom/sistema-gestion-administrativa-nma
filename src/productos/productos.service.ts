import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { CategoriasService } from '../categorias/categorias.service';
import { CalculosService } from '../calculos/calculos.service';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
    private readonly categorias: CategoriasService,
    private readonly calculos: CalculosService,
  ) {}

  listar(busqueda?: string) {
    if (busqueda?.trim()) {
      return this.repo.find({
        where: { nombre: Like(`%${busqueda.trim()}%`) },
        order: { nombre: 'ASC' },
        relations: ['categoria'],
      });
    }
    return this.repo.find({
      order: { nombre: 'ASC' },
      relations: ['categoria'],
    });
  }

  async metricas() {
    const productos = await this.repo.find();
    return this.calculos.calcularMetricasInventario(productos);
  }

  async obtener(id: number) {
    const producto = await this.repo.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async crear(dto: CrearProductoDto) {
    const categoria = await this.categorias.findProducto(dto.categoriaId);
    if (!categoria) throw new BadRequestException('Categoría de producto inválida');
    const producto = this.repo.create({
      ...dto,
      ubicacion: dto.ubicacion?.trim() || '',
      observaciones: dto.observaciones?.trim() || '',
    });
    return this.repo.save(producto);
  }

  async actualizar(id: number, dto: CrearProductoDto) {
    await this.obtener(id);
    const categoria = await this.categorias.findProducto(dto.categoriaId);
    if (!categoria) throw new BadRequestException('Categoría de producto inválida');
    await this.repo.update(id, {
      ...dto,
      ubicacion: dto.ubicacion?.trim() || '',
      observaciones: dto.observaciones?.trim() || '',
    });
    return this.obtener(id);
  }

  async eliminar(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Producto no encontrado');
  }

  async ajustarStock(id: number, delta: number) {
    const producto = await this.obtener(id);
    const nueva = producto.cantidadDisponible + delta;
    if (nueva < 0) {
      throw new BadRequestException(
        `No hay suficiente existencia de ${producto.nombre}. Disponible: ${producto.cantidadDisponible}`,
      );
    }
    producto.cantidadDisponible = nueva;
    return this.repo.save(producto);
  }
}
