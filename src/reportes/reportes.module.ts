import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { TareasModule } from '../tareas/tareas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TareasModule, AuthModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
