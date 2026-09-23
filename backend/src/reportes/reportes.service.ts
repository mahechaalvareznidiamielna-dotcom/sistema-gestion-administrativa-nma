import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { Movimiento } from '../movimientos/movimiento.entity';
import { TareasService } from '../tareas/tareas.service';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientos: Repository<Movimiento>,
    private readonly tareas: TareasService,
  ) {}

  async resumen(desde?: string, hasta?: string) {
    const { inicio, fin } = this.rango(desde, hasta);
    const items = await this.movimientos.find({
      where: { fecha: Between(inicio, fin) },
      order: { fecha: 'ASC' },
    });
    const anteriores = await this.movimientos.find({
      where: { fecha: LessThan(inicio) },
    });

    const totalIngresos = this.sumar(items, 'ingreso');
    const totalGastos = this.sumar(items, 'gasto');
    const saldoInicial =
      this.sumar(anteriores, 'ingreso') - this.sumar(anteriores, 'gasto');

    const mapa = new Map<string, number>();
    for (const item of items.filter((i) => i.tipo === 'gasto')) {
      const nombre = item.categoriaGasto?.nombre || 'Otros';
      mapa.set(nombre, (mapa.get(nombre) || 0) + Number(item.valor));
    }
    const gastosPorCategoria = [...mapa.entries()].map(([nombre, valor]) => ({
      nombre,
      valor,
      porcentaje: totalGastos ? Math.round((valor / totalGastos) * 100) : 0,
    }));

    return {
      desde: inicio,
      hasta: fin,
      totalIngresos,
      totalGastos,
      saldo: totalIngresos - totalGastos,
      saldoInicial,
      saldoFinal: saldoInicial + totalIngresos - totalGastos,
      ingresosVsGastos: {
        ingresos: totalIngresos,
        gastos: totalGastos,
      },
      gastosPorCategoria,
    };
  }

  async inicio() {
    const hoy = new Date();
    const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
    const finMes = this.ultimoDiaMes(hoy);
    const [resumen, tareasPendientes, totalPendientes, ultimosMovimientos] =
      await Promise.all([
        this.resumen(inicioMes, finMes),
        this.tareas.pendientesRecientes(5),
        this.tareas.contarPendientes(),
        this.movimientos.find({
          order: { fecha: 'DESC', id: 'DESC' },
          take: 5,
        }),
      ]);
    return {
      ...resumen,
      tareasPendientes,
      totalPendientes,
      ultimosMovimientos,
    };
  }

  private sumar(items: Movimiento[], tipo: 'ingreso' | 'gasto') {
    return items
      .filter((i) => i.tipo === tipo)
      .reduce((s, i) => s + Number(i.valor), 0);
  }

  private rango(desde?: string, hasta?: string) {
    const hoy = new Date();
    const inicio = desde || `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
    const fin = hasta || this.ultimoDiaMes(hoy);
    return { inicio, fin };
  }

  private ultimoDiaMes(fecha: Date) {
    const d = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
