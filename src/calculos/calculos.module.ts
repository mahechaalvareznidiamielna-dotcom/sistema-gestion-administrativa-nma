import { Global, Module } from '@nestjs/common';
import { CalculosService } from './calculos.service';

@Global()
@Module({
  providers: [CalculosService],
  exports: [CalculosService],
})
export class CalculosModule {}
