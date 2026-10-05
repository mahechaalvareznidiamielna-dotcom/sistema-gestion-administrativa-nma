import { Injectable, NotFoundException } from '@nestjs/common';
import { MemStoreService, MemTarea } from '../mem-store/mem-store.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';
import { CalculosService } from '../calculos/calculos.service';

@Injectable()
export class TareasService {
  constructor(
    private readonly store: MemStoreService,
    private readonly calculos: CalculosService,
  ) {}

  async listar(params: { q?: string; estado?: string; page?: number; limit?: number }) {
    const page  = Math.max(1, params.page  || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 8));
    let lista = [...this.store.tareas];
    if (params.estado === 'pendiente' || params.estado === 'completada') {
      lista = lista.filter(t => t.estado === params.estado);
    }
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      lista = lista.filter(t => t.nombre.toLowerCase().includes(q));
    }
    lista.sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite) || b.id - a.id);
    const total = lista.length;
    const items = lista.slice((page - 1) * limit, page * limit);
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  pendientesRecientes(limite = 5) {
    return [...this.store.tareas]
      .filter(t => t.estado === 'pendiente')
      .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))
      .slice(0, limite);
  }

  contarPendientes() {
    return Promise.resolve(this.store.tareas.filter(t => t.estado === 'pendiente').length);
  }

  async metricas() {
    return this.calculos.calcularMetricasTareas(this.store.tareas as any);
  }

  async obtener(id: number) {
    const t = this.store.tareas.find(x => x.id === id);
    if (!t) throw new NotFoundException('Tarea no encontrada');
    return t;
  }

  crear(dto: CrearTareaDto) {
    const nueva: MemTarea = {
      id: this.store.nextTareaId(),
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? '',
      fecha: dto.fecha,
      fechaLimite: dto.fechaLimite,
      prioridad: dto.prioridad ?? 'media',
      estado: dto.estado ?? 'pendiente',
    };
    this.store.tareas.push(nueva);
    return Promise.resolve(nueva);
  }

  async actualizar(id: number, dto: CrearTareaDto) {
    const idx = this.store.tareas.findIndex(x => x.id === id);
    if (idx < 0) throw new NotFoundException('Tarea no encontrada');
    this.store.tareas[idx] = { ...this.store.tareas[idx], ...dto, estado: dto.estado ?? 'pendiente' };
    return this.store.tareas[idx];
  }

  async eliminar(id: number) {
    const idx = this.store.tareas.findIndex(x => x.id === id);
    if (idx < 0) throw new NotFoundException('Tarea no encontrada');
    this.store.tareas.splice(idx, 1);
  }
}


