import { Global, Module } from '@nestjs/common';
import { CsvStore } from './csv.store';

@Global()
@Module({
  providers: [CsvStore],
  exports: [CsvStore],
})
export class CsvModule {}
