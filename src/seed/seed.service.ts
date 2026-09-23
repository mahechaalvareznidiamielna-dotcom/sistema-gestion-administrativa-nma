import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { CategoriaProducto } from '../categorias/categoria-producto.entity';
import { CategoriaGasto } from '../categorias/categoria-gasto.entity';
import { Producto } from '../productos/producto.entity';
import { Tarea } from '../tareas/tarea.entity';
import { Movimiento } from '../movimientos/movimiento.entity';
import { CsvStore, FILES, HEADERS } from '../csv/csv.store';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(CategoriaProducto)
    private readonly catProductos: Repository<CategoriaProducto>,
    @InjectRepository(CategoriaGasto)
    private readonly catGastos: Repository<CategoriaGasto>,
    @InjectRepository(Producto) private readonly productos: Repository<Producto>,
    @InjectRepository(Tarea) private readonly tareas: Repository<Tarea>,
    @InjectRepository(Movimiento)
    private readonly movimientos: Repository<Movimiento>,
    private readonly csvStore: CsvStore,
  ) {}

  async onModuleInit() {
    if ((await this.usuarios.count()) > 0) return;

    const passHash = await bcrypt.hash('Admin123', 10);
    const usuarioAdmin = await this.usuarios.save(
      this.usuarios.create({
        nombre: 'Nidia Milena Mahecha',
        email: 'admin@papeleria.com',
        password: passHash,
      }),
    );

    const nombresProd = [
      'Útiles escolares',
      'Maquillaje y productos de belleza',
      'Artículos para la cocina',
      'Artículos para el hogar',
      'Productos de papelería y oficina',
      'Juguetes',
      'Otros',
    ];
    const catsProd = await this.catProductos.save(
      nombresProd.map((nombre) => this.catProductos.create({ nombre })),
    );

    const nombresGasto = [
      'Compra de mercancía',
      'Servicios',
      'Transporte',
      'Arriendo',
      'Mantenimiento',
      'Otros',
    ];
    const catsGasto = await this.catGastos.save(
      nombresGasto.map((nombre) => this.catGastos.create({ nombre })),
    );

    const cat = (nombre: string) => catsProd.find((c) => c.nombre === nombre)!;
    const prods = await this.productos.save([
      this.productos.create({
        nombre: 'Cuaderno universitario',
        categoriaId: cat('Útiles escolares').id,
        cantidadDisponible: 24,
        precioCompra: 3200,
        precioVenta: 4500,
        ubicacion: 'Estante A1',
        observaciones: 'Rayado, 100 hojas',
      }),
      this.productos.create({
        nombre: 'Kit de lapiceros',
        categoriaId: cat('Productos de papelería y oficina').id,
        cantidadDisponible: 18,
        precioCompra: 2800,
        precioVenta: 4000,
        ubicacion: 'Estante A2',
        observaciones: 'Negro, azul y rojo',
      }),
      this.productos.create({
        nombre: 'Labial mate',
        categoriaId: cat('Maquillaje y productos de belleza').id,
        cantidadDisponible: 10,
        precioCompra: 5500,
        precioVenta: 8000,
        ubicacion: 'Vitrina B',
        observaciones: 'Colores surtidos',
      }),
      this.productos.create({
        nombre: 'Juego de cubiertos de cocina',
        categoriaId: cat('Artículos para la cocina').id,
        cantidadDisponible: 12,
        precioCompra: 8500,
        precioVenta: 13000,
        ubicacion: 'Estante C1',
        observaciones: 'Acero inoxidable',
      }),
      this.productos.create({
        nombre: 'Organizador para el hogar',
        categoriaId: cat('Artículos para el hogar').id,
        cantidadDisponible: 8,
        precioCompra: 12000,
        precioVenta: 18500,
        ubicacion: 'Estante C2',
        observaciones: 'Plástico reforzado multiusos',
      }),
      this.productos.create({
        nombre: 'Coche de carreras de juguete',
        categoriaId: cat('Juguetes').id,
        cantidadDisponible: 15,
        precioCompra: 4500,
        precioVenta: 7500,
        ubicacion: 'Estante D',
        observaciones: '',
      }),
    ]);

    // 8 tareas pendientes y 1 completada, exactamente como en el diseño UI de Nidia Mahecha
    const itemsTareas = await this.tareas.save([
      this.tareas.create({
        nombre: 'Enviar informe mensual',
        descripcion: 'Consolidar ventas y gastos del mes',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-15',
        prioridad: 'alta',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Reunión con proveedor',
        descripcion: 'Revisar pedido de útiles escolares',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-16',
        prioridad: 'media',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Revisar pagos pendientes',
        descripcion: 'Verificar recibos de servicios',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-17',
        prioridad: 'media',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Actualizar inventario',
        descripcion: 'Contar existencias y ajustar cantidades',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-18',
        prioridad: 'baja',
        estado: 'completada',
      }),
      this.tareas.create({
        nombre: 'Capacitación del personal',
        descripcion: 'Uso del sistema de gestión administrativa',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-20',
        prioridad: 'media',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Revisar stock de cartulinas y foami',
        descripcion: 'Verificar existencias para temporada escolar',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-21',
        prioridad: 'alta',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Actualizar lista de precios de papelería',
        descripcion: 'Ajustar márgenes según nuevos costos de insumos',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-22',
        prioridad: 'media',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Organizar estantes de belleza y hogar',
        descripcion: 'Optimizar espacio disponible en vitrinas B y C',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-23',
        prioridad: 'baja',
        estado: 'pendiente',
      }),
      this.tareas.create({
        nombre: 'Contactar transportadora de pedidos',
        descripcion: 'Cotizar envíos a domicilio para clientes frecuentes',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-24',
        prioridad: 'alta',
        estado: 'pendiente',
      }),
    ]);

    const gasto = (nombre: string) =>
      catsGasto.find((c) => c.nombre === nombre)!;

    // Totales: Ingresos: $5.250.000 | Gastos: $2.870.000 | Saldo: $2.380.000 (idéntico al wireframe)
    const itemsMovimientos = await this.movimientos.save([
      this.movimientos.create({
        tipo: 'ingreso',
        fecha: '2026-09-14',
        descripcion: 'Venta de productos',
        valor: 1500000,
        formaPago: 'efectivo',
        cantidad: 2,
        productoId: prods[0].id,
        observacion: 'Venta en mostrador',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-14',
        descripcion: 'Pago de servicios',
        valor: 350000,
        categoriaGastoId: gasto('Servicios').id,
        observacion: 'Energía y agua',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-13',
        descripcion: 'Compra de papelería',
        valor: 120000,
        categoriaGastoId: gasto('Compra de mercancía').id,
        observacion: 'Resmas de papel y cartulinas',
      }),
      this.movimientos.create({
        tipo: 'ingreso',
        fecha: '2026-09-12',
        descripcion: 'Cobro a cliente',
        valor: 750000,
        formaPago: 'transferencia',
        observacion: 'Factura 104',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-11',
        descripcion: 'Transporte',
        valor: 80000,
        categoriaGastoId: gasto('Transporte').id,
        observacion: 'Acarreo de insumos',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-10',
        descripcion: 'Arriendo del local',
        valor: 2320000,
        categoriaGastoId: gasto('Arriendo').id,
        observacion: 'Canon mensual local papelería',
      }),
      this.movimientos.create({
        tipo: 'ingreso',
        fecha: '2026-09-08',
        descripcion: 'Venta corporativa útiles de oficina',
        valor: 3000000,
        formaPago: 'transferencia',
        observacion: 'Pedido institucional SENA / colegios',
      }),
    ]);

    // Guardar copia sincronizada en CSV y JSON
    try {
      this.csvStore.write(
        FILES.usuarios,
        [
          {
            id: usuarioAdmin.id,
            nombre: usuarioAdmin.nombre,
            email: usuarioAdmin.email,
            password: usuarioAdmin.password,
            creadoEn: usuarioAdmin.creadoEn,
          },
        ],
        HEADERS.usuarios,
      );
      this.csvStore.write(FILES.categoriasProducto, catsProd, HEADERS.categoriasProducto);
      this.csvStore.write(FILES.categoriasGasto, catsGasto, HEADERS.categoriasGasto);
      this.csvStore.write(FILES.productos, prods, HEADERS.productos);
      this.csvStore.write(FILES.tareas, itemsTareas, HEADERS.tareas);
      this.csvStore.write(FILES.movimientos, itemsMovimientos, HEADERS.movimientos);
    } catch (e) {
      console.warn('Persistencia inicial en CSV/JSON opcional omitida:', e);
    }
  }
}
