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
  ) {}

  async onModuleInit() {
    if ((await this.usuarios.count()) > 0) return;

    await this.usuarios.save(
      this.usuarios.create({
        nombre: 'Nidia Mahecha',
        email: 'admin@papeleria.com',
        password: await bcrypt.hash('Admin123', 10),
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
    const productos = await this.productos.save([
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
        observaciones: '',
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
    ]);

    await this.tareas.save([
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
        descripcion: 'Uso del sistema de gestión',
        fecha: '2026-09-14',
        fechaLimite: '2026-09-20',
        prioridad: 'media',
        estado: 'pendiente',
      }),
    ]);

    const gasto = (nombre: string) => catsGasto.find((c) => c.nombre === nombre)!;
    await this.movimientos.save([
      this.movimientos.create({
        tipo: 'ingreso',
        fecha: '2026-09-14',
        descripcion: 'Venta de productos',
        valor: 1500000,
        formaPago: 'efectivo',
        cantidad: 2,
        productoId: productos[0].id,
        observacion: '',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-14',
        descripcion: 'Pago de servicios',
        valor: 350000,
        categoriaGastoId: gasto('Servicios').id,
        observacion: '',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-13',
        descripcion: 'Compra de papelería',
        valor: 120000,
        categoriaGastoId: gasto('Compra de mercancía').id,
        observacion: '',
      }),
      this.movimientos.create({
        tipo: 'ingreso',
        fecha: '2026-09-12',
        descripcion: 'Cobro a cliente',
        valor: 750000,
        formaPago: 'transferencia',
        observacion: '',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-11',
        descripcion: 'Transporte',
        valor: 80000,
        categoriaGastoId: gasto('Transporte').id,
        observacion: '',
      }),
      this.movimientos.create({
        tipo: 'gasto',
        fecha: '2026-09-10',
        descripcion: 'Arriendo del local',
        valor: 2320000,
        categoriaGastoId: gasto('Arriendo').id,
        observacion: '',
      }),
    ]);
  }
}
