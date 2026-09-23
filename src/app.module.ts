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

// Determinar si estamos en Vercel (sistema de archivos de sólo lectura)
const isVercel = Boolean(process.env.VERCEL);

// Directorio de datos adaptativo
const dataDir = isVercel ? '/tmp' : join(process.cwd(), 'data');

try {
  mkdirSync(dataDir, { recursive: true });
} catch {
  // Ya existe
}

// Base de datos SQLite
const dbPath = join(dataDir, 'papeleria.sqlite');

// En Vercel, copiar la base de datos semilla desde el bundle si no existe
if (isVercel && !existsSync(dbPath)) {
  const seedDb = join(process.cwd(), 'data', 'papeleria.sqlite');
  if (existsSync(seedDb)) {
    try {
      copyFileSync(seedDb, dbPath);
    } catch (e) {
      console.warn('No se pudo copiar BD inicial a /tmp:', e);
    }
  }
}

// Resolver raíz del cliente (dist/client en producción, client/ en desarrollo)
function resolveClientRoot(): string {
  // 1. dist/client (producción - npm run build)
  const distClient = join(process.cwd(), 'dist', 'client');
  if (existsSync(distClient) && existsSync(join(distClient, 'index.html'))) {
    return distClient;
  }
  // 2. client/ directamente (modo dev sin build previo del cliente)
  const devClient = join(process.cwd(), 'client');
  if (existsSync(devClient) && existsSync(join(devClient, 'index.html'))) {
    return devClient;
  }
  // 3. Fallback al directorio raíz
  return process.cwd();
}

const clientRoot = resolveClientRoot();
console.log(`[AppModule] Sirviendo cliente desde: ${clientRoot}`);

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
      logging: false,
    }),
    // Servir el frontend como SPA: todas las rutas desconocidas vuelven a index.html
    ServeStaticModule.forRoot({
      rootPath: clientRoot,
      exclude: ['/api*'],
      serveStaticOptions: {
        fallthrough: true,
      },
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
