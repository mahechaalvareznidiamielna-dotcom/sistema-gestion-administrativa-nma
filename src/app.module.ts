import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
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

// ─────────────────────────────────────────────────────────────
// BD EN MEMORIA: sqlite en RAM, sin archivo físico
// ─────────────────────────────────────────────────────────────

// Resolver raíz del cliente (dist/client en producción, client/ en desarrollo)
function resolveClientRoot(): string {
  const distClient = join(process.cwd(), 'dist', 'client');
  if (existsSync(distClient) && existsSync(join(distClient, 'index.html'))) {
    return distClient;
  }
  const devClient = join(process.cwd(), 'client');
  if (existsSync(devClient) && existsSync(join(devClient, 'index.html'))) {
    return devClient;
  }
  return process.cwd();
}

const clientRoot = resolveClientRoot();
console.log(`[AppModule] Sirviendo cliente desde: ${clientRoot}`);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      // Sin 'location' ni 'autoSave' → BD 100% en memoria (no requiere archivo)
      autoSave: false,
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
