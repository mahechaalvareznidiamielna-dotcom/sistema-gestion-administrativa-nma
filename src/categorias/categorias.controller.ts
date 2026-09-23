import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriasService } from './categorias.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';

@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categorias: CategoriasService) {}

  @Get('productos')
  listarProductos() {
    return this.categorias.listarProductos();
  }

  @Post('productos')
  crearProducto(@Body() dto: CrearCategoriaDto) {
    return this.categorias.crearProducto(dto);
  }

  @Patch('productos/:id')
  actualizarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearCategoriaDto,
  ) {
    return this.categorias.actualizarProducto(id, dto);
  }

  @Delete('productos/:id')
  eliminarProducto(@Param('id', ParseIntPipe) id: number) {
    return this.categorias.eliminarProducto(id);
  }

  @Get('gastos')
  listarGastos() {
    return this.categorias.listarGastos();
  }

  @Post('gastos')
  crearGasto(@Body() dto: CrearCategoriaDto) {
    return this.categorias.crearGasto(dto);
  }

  @Patch('gastos/:id')
  actualizarGasto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearCategoriaDto,
  ) {
    return this.categorias.actualizarGasto(id, dto);
  }

  @Delete('gastos/:id')
  eliminarGasto(@Param('id', ParseIntPipe) id: number) {
    return this.categorias.eliminarGasto(id);
  }
}
