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
import { TareasService } from './tareas.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';

@UseGuards(JwtAuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareas: TareasService) {}

  @Get('metricas')
  metricas() {
    return this.tareas.metricas();
  }

  @Get()
  listar(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tareas.listar({
      q,
      estado,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 8,
    });
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.tareas.obtener(id);
  }

  @Post()
  crear(@Body() dto: CrearTareaDto) {
    return this.tareas.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearTareaDto,
  ) {
    return this.tareas.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.tareas.eliminar(id);
  }
}
