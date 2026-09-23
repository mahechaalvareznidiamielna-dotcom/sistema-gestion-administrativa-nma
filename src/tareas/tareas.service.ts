import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Tarea } from './tarea.entity';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { CalculosService } from '../calculos/calculos.service';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private readonly repo: Repository<Tarea>,
    private readonly calculos: CalculosService,
  ) {}

  async listar(params: {
    q?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 8));
    const where: any = {};
    if (params.estado === 'pendiente' || params.estado === 'completada') {
      where.estado = params.estado;
    }
    if (params.q?.trim()) {
      where.nombre = Like(`%${params.q.trim()}%`);
    }
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { fechaLimite: 'ASC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  pendientesRecientes(limite = 5) {
    return this.repo.find({
      where: { estado: 'pendiente' },
      order: { fechaLimite: 'ASC' },
      take: limite,
    });
  }

  contarPendientes() {
    return this.repo.count({ where: { estado: 'pendiente' } });
  }

  async metricas() {
    const tareas = await this.repo.find();
    return this.calculos.calcularMetricasTareas(tareas);
  }

  async obtener(id: number) {
    const tarea = await this.repo.findOne({ where: { id } });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    return tarea;
  }

  crear(dto: CrearTareaDto) {
    return this.repo.save(
      this.repo.create({
        ...dto,
        estado: dto.estado || 'pendiente',
      }),
    );
  }

  async actualizar(id: number, dto: CrearTareaDto) {
    await this.obtener(id);
    await this.repo.update(id, { ...dto, estado: dto.estado || 'pendiente' });
    return this.obtener(id);
  }

  async eliminar(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Tarea no encontrada');
  }
}
