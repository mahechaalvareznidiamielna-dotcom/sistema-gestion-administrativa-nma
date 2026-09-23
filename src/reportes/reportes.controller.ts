import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Get('reportes')
  reportesPeriodo(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportes.resumen(desde, hasta);
  }

  @Get('inicio')
  inicio() {
    return this.reportes.inicio();
  }
}
