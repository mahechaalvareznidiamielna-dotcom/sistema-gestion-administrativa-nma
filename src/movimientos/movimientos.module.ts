import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { ProductosModule } from '../productos/productos.module';
import { CategoriasModule } from '../categorias/categorias.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ProductosModule, CategoriasModule, AuthModule],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
