import { Global, Module } from '@nestjs/common';
import { MemStoreService } from './mem-store.service';

@Global()
@Module({
  providers: [MemStoreService],
  exports: [MemStoreService],
})
export class MemStoreModule {}
