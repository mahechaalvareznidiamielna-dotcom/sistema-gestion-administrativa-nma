import { Injectable, BadRequestException } from '@nestjs/common';

export interface ResumenTotales {
  totalIngresos: number;
  totalGastos: number;
  saldo: number;
  margenUtilidad: number;
  cantidadMovimientos: number;
}

export interface GastoCategoriaItem {
  nombre: string;
  valor: number;
  porcentaje: number;
}

export interface MetricasTareas {
  total: number;
  pendientes: number;
  completadas: number;
  porcentajeCompletadas: number;
  alta: number;
  media: number;
  baja: number;
}

export interface MetricasInventario {
  totalProductos: number;
  totalUnidades: number;
  costoTotal: number;
  valorVentaEstimado: number;
  gananciaEstimada: number;
}

@Injectable()
export class CalculosService {
  /**
   * Calcula totales financieros: ingresos, gastos, saldo y margen
   */
  calcularTotales(
    movimientos: Array<{ tipo: string; valor: number | string }>,
  ): ResumenTotales {
    const totalIngresos = movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((acum, m) => acum + Number(m.valor || 0), 0);

    const totalGastos = movimientos
      .filter((m) => m.tipo === 'gasto')
      .reduce((acum, m) => acum + Number(m.valor || 0), 0);

    const saldo = totalIngresos - totalGastos;
    const margenUtilidad =
      totalIngresos > 0 ? Math.round((saldo / totalIngresos) * 100) : 0;

    return {
      totalIngresos,
      totalGastos,
      saldo,
      margenUtilidad,
      cantidadMovimientos: movimientos.length,
    };
  }

  /**
   * Calcula la distribución de gastos por categoría y su porcentaje del total
   */
  calcularGastosPorCategoria(
    movimientos: Array<{
      tipo: string;
      valor: number | string;
      categoriaGasto?: { nombre?: string } | null;
    }>,
    totalGastos: number,
  ): GastoCategoriaItem[] {
    const mapa = new Map<string, number>();

    for (const item of movimientos.filter((m) => m.tipo === 'gasto')) {
      const nombre = item.categoriaGasto?.nombre || 'Otros';
      mapa.set(nombre, (mapa.get(nombre) || 0) + Number(item.valor || 0));
    }

    return Array.from(mapa.entries())
      .map(([nombre, valor]) => ({
        nombre,
        valor,
        porcentaje:
          totalGastos > 0 ? Math.round((valor / totalGastos) * 100) : 0,
      }))
      .sort((a, b) => b.valor - a.valor);
  }

  /**
   * Calcula el saldo inicial previo a un período determinado
   */
  calcularSaldoPrevio(
    movimientosPrevios: Array<{ tipo: string; valor: number | string }>,
  ): number {
    const ing = movimientosPrevios
      .filter((m) => m.tipo === 'ingreso')
      .reduce((s, m) => s + Number(m.valor || 0), 0);
    const gas = movimientosPrevios
      .filter((m) => m.tipo === 'gasto')
      .reduce((s, m) => s + Number(m.valor || 0), 0);
    return ing - gas;
  }

  /**
   * Aplica deducción de inventario para una venta
   */
  deducirInventario(stockActual: number, cantidadVendida: number): number {
    if (cantidadVendida <= 0) {
      throw new BadRequestException('La cantidad vendida debe ser mayor a cero');
    }
    if (stockActual < cantidadVendida) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${cantidadVendida}`,
      );
    }
    return stockActual - cantidadVendida;
  }

  /**
   * Calcula métricas y KPIs de tareas
   */
  calcularMetricasTareas(
    tareas: Array<{ estado: string; prioridad: string }>,
  ): MetricasTareas {
    const total = tareas.length;
    const pendientes = tareas.filter((t) => t.estado === 'pendiente').length;
    const completadas = tareas.filter((t) => t.estado === 'completada').length;
    const porcentajeCompletadas =
      total > 0 ? Math.round((completadas / total) * 100) : 0;

    const alta = tareas.filter(
      (t) => t.prioridad === 'alta' && t.estado === 'pendiente',
    ).length;
    const media = tareas.filter(
      (t) => t.prioridad === 'media' && t.estado === 'pendiente',
    ).length;
    const baja = tareas.filter(
      (t) => t.prioridad === 'baja' && t.estado === 'pendiente',
    ).length;

    return {
      total,
      pendientes,
      completadas,
      porcentajeCompletadas,
      alta,
      media,
      baja,
    };
  }

  /**
   * Calcula el valor patrimonial del inventario de la papelería
   */
  calcularMetricasInventario(
    productos: Array<{
      cantidadDisponible: number;
      precioCompra: number;
      precioVenta: number;
    }>,
  ): MetricasInventario {
    const totalProductos = productos.length;
    const totalUnidades = productos.reduce(
      (s, p) => s + Number(p.cantidadDisponible || 0),
      0,
    );
    const costoTotal = productos.reduce(
      (s, p) =>
        s +
        Number(p.cantidadDisponible || 0) * Number(p.precioCompra || 0),
      0,
    );
    const valorVentaEstimado = productos.reduce(
      (s, p) =>
        s +
        Number(p.cantidadDisponible || 0) * Number(p.precioVenta || 0),
      0,
    );
    const gananciaEstimada = valorVentaEstimado - costoTotal;

    return {
      totalProductos,
      totalUnidades,
      costoTotal,
      valorVentaEstimado,
      gananciaEstimada,
    };
  }
}
