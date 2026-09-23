import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { TareasModule } from './tareas/tareas.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeedModule } from './seed/seed.module';
import { Usuario } from './usuarios/usuario.entity';
import { CategoriaProducto } from './categorias/categoria-producto.entity';
import { CategoriaGasto } from './categorias/categoria-gasto.entity';
import { Producto } from './productos/producto.entity';
import { Tarea } from './tareas/tarea.entity';
import { Movimiento } from './movimientos/movimiento.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: join(__dirname, '..', 'data', 'papeleria.sqlite'),
      autoSave: true,
      entities: [
        Usuario,
        CategoriaProducto,
        CategoriaGasto,
        Producto,
        Tarea,
        Movimiento,
      ],
      synchronize: true,
    }),
    AuthModule,
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    TareasModule,
    MovimientosModule,
    ReportesModule,
    SeedModule,
  ],
})
export class AppModule {}
