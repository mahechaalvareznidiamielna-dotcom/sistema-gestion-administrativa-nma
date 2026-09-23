import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from '../movimientos/movimiento.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { TareasModule } from '../tareas/tareas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento]), TareasModule, AuthModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
