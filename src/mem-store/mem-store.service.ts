import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────────────────────
// STORE EN MEMORIA – reemplaza TypeORM + sql.js
// Compatible con Vercel y cualquier entorno serverless
// ─────────────────────────────────────────────────────────────

export interface MemCategoriaProducto { id: number; nombre: string; }
export interface MemCategoriaGasto    { id: number; nombre: string; }
export interface MemProducto {
  id: number; nombre: string; categoriaId: number;
  cantidadDisponible: number; precioCompra: number; precioVenta: number;
  ubicacion: string; observaciones: string;
}
export interface MemTarea {
  id: number; nombre: string; descripcion: string;
  fecha: string; fechaLimite: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'completada';
}
export interface MemMovimiento {
  id: number; tipo: 'ingreso' | 'gasto'; fecha: string;
  descripcion: string; valor: number; observacion: string;
  formaPago: string | null; cantidad: number | null;
  categoriaGastoId: number | null; productoId: number | null;
}
export interface MemUsuario {
  id: number; nombre: string; email: string; password: string; creadoEn: string;
}

function nextId<T extends { id: number }>(arr: T[]): number {
  return arr.reduce((m, r) => Math.max(m, r.id), 0) + 1;
}

@Injectable()
export class MemStoreService implements OnModuleInit {
  readonly categoriasProducto: MemCategoriaProducto[] = [];
  readonly categoriasGasto: MemCategoriaGasto[]       = [];
  readonly productos: MemProducto[]                   = [];
  readonly tareas: MemTarea[]                         = [];
  readonly movimientos: MemMovimiento[]               = [];
  readonly usuarios: MemUsuario[]                     = [];

  private seeded = false;

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    if (this.seeded) return;
    this.seeded = true;

    // ── Categorías de producto ────────────────────────────────
    const nombresProd = [
      'Útiles escolares',
      'Maquillaje y productos de belleza',
      'Artículos para la cocina',
      'Artículos para el hogar',
      'Productos de papelería y oficina',
      'Juguetes',
      'Otros',
    ];
    nombresProd.forEach((nombre, i) =>
      this.categoriasProducto.push({ id: i + 1, nombre }),
    );

    // ── Categorías de gasto ───────────────────────────────────
    const nombresGasto = [
      'Compra de mercancía',
      'Servicios',
      'Transporte',
      'Arriendo',
      'Mantenimiento',
      'Otros',
    ];
    nombresGasto.forEach((nombre, i) =>
      this.categoriasGasto.push({ id: i + 1, nombre }),
    );

    const catP = (n: string) => this.categoriasProducto.find(c => c.nombre === n)!;
    const catG = (n: string) => this.categoriasGasto.find(c => c.nombre === n)!;

    // ── Productos ─────────────────────────────────────────────
    const productosData: Omit<MemProducto, 'id'>[] = [
      { nombre: 'Cuaderno universitario',       categoriaId: catP('Útiles escolares').id,                    cantidadDisponible: 24, precioCompra: 3200,  precioVenta: 4500,  ubicacion: 'Estante A1', observaciones: 'Rayado, 100 hojas' },
      { nombre: 'Kit de lapiceros',             categoriaId: catP('Productos de papelería y oficina').id,    cantidadDisponible: 18, precioCompra: 2800,  precioVenta: 4000,  ubicacion: 'Estante A2', observaciones: 'Negro, azul y rojo' },
      { nombre: 'Labial mate',                  categoriaId: catP('Maquillaje y productos de belleza').id,   cantidadDisponible: 10, precioCompra: 5500,  precioVenta: 8000,  ubicacion: 'Vitrina B',  observaciones: 'Colores surtidos' },
      { nombre: 'Juego de cubiertos de cocina', categoriaId: catP('Artículos para la cocina').id,            cantidadDisponible: 12, precioCompra: 8500,  precioVenta: 13000, ubicacion: 'Estante C1', observaciones: 'Acero inoxidable' },
      { nombre: 'Organizador para el hogar',    categoriaId: catP('Artículos para el hogar').id,             cantidadDisponible: 8,  precioCompra: 12000, precioVenta: 18500, ubicacion: 'Estante C2', observaciones: 'Plástico reforzado multiusos' },
      { nombre: 'Coche de carreras de juguete', categoriaId: catP('Juguetes').id,                            cantidadDisponible: 15, precioCompra: 4500,  precioVenta: 7500,  ubicacion: 'Estante D',  observaciones: '' },
    ];
    productosData.forEach((p, i) => this.productos.push({ id: i + 1, ...p }));

    // ── Tareas ────────────────────────────────────────────────
    const tareasData: Omit<MemTarea, 'id'>[] = [
      { nombre: 'Enviar informe mensual',                descripcion: 'Consolidar ventas y gastos del mes',              fecha: '2026-09-14', fechaLimite: '2026-09-15', prioridad: 'alta',  estado: 'pendiente'  },
      { nombre: 'Reunión con proveedor',                 descripcion: 'Revisar pedido de útiles escolares',              fecha: '2026-09-14', fechaLimite: '2026-09-16', prioridad: 'media', estado: 'pendiente'  },
      { nombre: 'Revisar pagos pendientes',              descripcion: 'Verificar recibos de servicios',                  fecha: '2026-09-14', fechaLimite: '2026-09-17', prioridad: 'media', estado: 'pendiente'  },
      { nombre: 'Actualizar inventario',                 descripcion: 'Contar existencias y ajustar cantidades',         fecha: '2026-09-14', fechaLimite: '2026-09-18', prioridad: 'baja',  estado: 'completada' },
      { nombre: 'Capacitación del personal',             descripcion: 'Uso del sistema de gestión administrativa',       fecha: '2026-09-14', fechaLimite: '2026-09-20', prioridad: 'media', estado: 'pendiente'  },
      { nombre: 'Revisar stock de cartulinas y foami',   descripcion: 'Verificar existencias para temporada escolar',   fecha: '2026-09-14', fechaLimite: '2026-09-21', prioridad: 'alta',  estado: 'pendiente'  },
      { nombre: 'Actualizar lista de precios de papelería', descripcion: 'Ajustar márgenes según nuevos costos de insumos', fecha: '2026-09-14', fechaLimite: '2026-09-22', prioridad: 'media', estado: 'pendiente' },
      { nombre: 'Organizar estantes de belleza y hogar', descripcion: 'Optimizar espacio disponible en vitrinas B y C', fecha: '2026-09-14', fechaLimite: '2026-09-23', prioridad: 'baja',  estado: 'pendiente'  },
      { nombre: 'Contactar transportadora de pedidos',   descripcion: 'Cotizar envíos a domicilio para clientes frecuentes', fecha: '2026-09-14', fechaLimite: '2026-09-24', prioridad: 'alta', estado: 'pendiente' },
    ];
    tareasData.forEach((t, i) => this.tareas.push({ id: i + 1, ...t }));

    // ── Movimientos ───────────────────────────────────────────
    const movsData: Omit<MemMovimiento, 'id'>[] = [
      { tipo: 'ingreso', fecha: '2026-09-14', descripcion: 'Venta de productos',                  valor: 1500000, formaPago: 'efectivo',     cantidad: 2,    categoriaGastoId: null,               productoId: 1, observacion: 'Venta en mostrador' },
      { tipo: 'gasto',   fecha: '2026-09-14', descripcion: 'Pago de servicios',                   valor: 350000,  formaPago: null,            cantidad: null, categoriaGastoId: catG('Servicios').id, productoId: null, observacion: 'Energía y agua' },
      { tipo: 'gasto',   fecha: '2026-09-13', descripcion: 'Compra de papelería',                 valor: 120000,  formaPago: null,            cantidad: null, categoriaGastoId: catG('Compra de mercancía').id, productoId: null, observacion: 'Resmas de papel y cartulinas' },
      { tipo: 'ingreso', fecha: '2026-09-12', descripcion: 'Cobro a cliente',                     valor: 750000,  formaPago: 'transferencia', cantidad: null, categoriaGastoId: null,               productoId: null, observacion: 'Factura 104' },
      { tipo: 'gasto',   fecha: '2026-09-11', descripcion: 'Transporte',                          valor: 80000,   formaPago: null,            cantidad: null, categoriaGastoId: catG('Transporte').id, productoId: null, observacion: 'Acarreo de insumos' },
      { tipo: 'gasto',   fecha: '2026-09-10', descripcion: 'Arriendo del local',                  valor: 2320000, formaPago: null,            cantidad: null, categoriaGastoId: catG('Arriendo').id,  productoId: null, observacion: 'Canon mensual local papelería' },
      { tipo: 'ingreso', fecha: '2026-09-08', descripcion: 'Venta corporativa útiles de oficina', valor: 3000000, formaPago: 'transferencia', cantidad: null, categoriaGastoId: null,               productoId: null, observacion: 'Pedido institucional SENA / colegios' },
    ];
    movsData.forEach((m, i) => this.movimientos.push({ id: i + 1, ...m }));

    // ── Usuario admin ─────────────────────────────────────────
    const passHash = await bcrypt.hash('Admin123', 10);
    this.usuarios.push({
      id: 1,
      nombre: 'Nidia Milena Mahecha',
      email: 'admin@papeleria.com',
      password: passHash,
      creadoEn: new Date().toISOString(),
    });
  }

  // ── Helpers genéricos ─────────────────────────────────────
  nextProductoId()    { return nextId(this.productos); }
  nextTareaId()       { return nextId(this.tareas); }
  nextMovimientoId()  { return nextId(this.movimientos); }
  nextCatProdId()     { return nextId(this.categoriasProducto); }
  nextCatGastoId()    { return nextId(this.categoriasGasto); }

  // Adjunta relaciones a un producto
  resolveProducto(p: MemProducto) {
    return {
      ...p,
      categoria: this.categoriasProducto.find(c => c.id === p.categoriaId) ?? null,
    };
  }

  // Adjunta relaciones a un movimiento
  resolveMovimiento(m: MemMovimiento) {
    return {
      ...m,
      categoriaGasto: m.categoriaGastoId
        ? this.categoriasGasto.find(c => c.id === m.categoriaGastoId) ?? null
        : null,
      producto: m.productoId
        ? this.resolveProducto(this.productos.find(p => p.id === m.productoId)!)
        : null,
    };
  }
}
