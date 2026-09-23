import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { TareasModule } from './tareas/tareas.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeedModule } from './seed/seed.module';
import { CalculosModule } from './calculos/calculos.module';
import { CsvModule } from './csv/csv.module';
import { Usuario } from './usuarios/usuario.entity';
import { CategoriaProducto } from './categorias/categoria-producto.entity';
import { CategoriaGasto } from './categorias/categoria-gasto.entity';
import { Producto } from './productos/producto.entity';
import { Tarea } from './tareas/tarea.entity';
import { Movimiento } from './movimientos/movimiento.entity';

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? '/tmp' : join(process.cwd(), 'data');

try {
  mkdirSync(dataDir, { recursive: true });
} catch {
  // Ignorar si el directorio ya existe
}

const dbPath = join(dataDir, 'papeleria.sqlite');
if (isVercel && !existsSync(dbPath)) {
  const seedDb = join(process.cwd(), 'data', 'papeleria.sqlite');
  if (existsSync(seedDb)) {
    try {
      copyFileSync(seedDb, dbPath);
    } catch (e) {
      console.warn('No se pudo copiar base de datos inicial a /tmp:', e);
    }
  }
}

const distClientPath = join(process.cwd(), 'dist', 'client');
const clientRoot = existsSync(distClientPath)
  ? distClientPath
  : join(process.cwd(), 'client');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: dbPath,
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
    ServeStaticModule.forRoot({
      rootPath: clientRoot,
      exclude: ['/api/(.*)'],
    }),
    CalculosModule,
    CsvModule,
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
