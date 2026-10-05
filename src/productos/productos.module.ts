import { Module } from '@nestjs/common';
import { MemStoreModule } from '../mem-store/mem-store.module';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { CategoriasModule } from '../categorias/categorias.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MemStoreModule, CategoriasModule, AuthModule],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
