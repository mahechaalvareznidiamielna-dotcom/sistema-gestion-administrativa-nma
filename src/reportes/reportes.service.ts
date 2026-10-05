import { Injectable } from '@nestjs/common';
import { MemStoreService } from '../mem-store/mem-store.service';
import { TareasService } from '../tareas/tareas.service';
import { CalculosService } from '../calculos/calculos.service';

@Injectable()
export class ReportesService {
  constructor(
    private readonly store: MemStoreService,
    private readonly tareas: TareasService,
    private readonly calculos: CalculosService,
  ) {}

  async resumen(desde?: string, hasta?: string) {
    const { inicio, fin } = this.rango(desde, hasta);
    let items = [...this.store.movimientos];
    const anteriores = items.filter(m => m.fecha < inicio);
    items = items.filter(m => m.fecha >= inicio && m.fecha <= fin);
    items.sort((a, b) => a.fecha.localeCompare(b.fecha));

    const resueltos = items.map(m => this.store.resolveMovimiento(m));
    const { totalIngresos, totalGastos, saldo, margenUtilidad } =
      this.calculos.calcularTotales(resueltos as any);
    const saldoInicial = this.calculos.calcularSaldoPrevio(anteriores as any);
    const gastosPorCategoria = this.calculos.calcularGastosPorCategoria(resueltos as any, totalGastos);

    return {
      desde: inicio,
      hasta: fin,
      totalIngresos,
      totalGastos,
      saldo,
      saldoInicial,
      saldoFinal: saldoInicial + saldo,
      margenUtilidad,
      ingresosVsGastos: { ingresos: totalIngresos, gastos: totalGastos },
      gastosPorCategoria,
    };
  }

  async inicio() {
    const hoy = new Date();
    const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
    const finMes = this.ultimoDiaMes(hoy);
    const [resumen, tareasPendientes, totalPendientes] = await Promise.all([
      this.resumen(inicioMes, finMes),
      this.tareas.pendientesRecientes(5),
      this.tareas.contarPendientes(),
    ]);
    const ultimosMovimientos = [...this.store.movimientos]
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
      .slice(0, 5)
      .map(m => this.store.resolveMovimiento(m));
    return { ...resumen, tareasPendientes, totalPendientes, ultimosMovimientos };
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
