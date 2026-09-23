import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MovimientosService } from './movimientos.service';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';

@UseGuards(JwtAuthGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientos: MovimientosService) {}

  @Get()
  listar(
    @Query('q') q?: string,
    @Query('tipo') tipo?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('categoriaGastoId') categoriaGastoId?: string,
  ) {
    return this.movimientos.listar({
      q,
      tipo,
      desde,
      hasta,
      categoriaGastoId: categoriaGastoId ? Number(categoriaGastoId) : undefined,
    });
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.movimientos.obtener(id);
  }

  @Post()
  crear(@Body() dto: CrearMovimientoDto) {
    return this.movimientos.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearMovimientoDto,
  ) {
    return this.movimientos.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.movimientos.eliminar(id);
  }
}
