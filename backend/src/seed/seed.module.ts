import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Usuario } from '../usuarios/usuario.entity';
import { CategoriaProducto } from '../categorias/categoria-producto.entity';
import { CategoriaGasto } from '../categorias/categoria-gasto.entity';
import { Producto } from '../productos/producto.entity';
import { Tarea } from '../tareas/tarea.entity';
import { Movimiento } from '../movimientos/movimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      CategoriaProducto,
      CategoriaGasto,
      Producto,
      Tarea,
      Movimiento,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
