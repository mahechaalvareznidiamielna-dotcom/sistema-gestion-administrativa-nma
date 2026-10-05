import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { MemStoreModule } from './mem-store/mem-store.module';

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

const staticImports = process.env.VERCEL
  ? []
  : [
      ServeStaticModule.forRoot({
        rootPath: resolveClientRoot(),
        exclude: ['/api*'],
        serveStaticOptions: {
          fallthrough: true,
        },
      }),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...staticImports,
    MemStoreModule,
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
