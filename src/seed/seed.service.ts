import { Injectable, OnModuleInit } from '@nestjs/common';
import { MemStoreService } from '../mem-store/mem-store.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly store: MemStoreService) {}

  async onModuleInit() {
    await this.store.seed();
  }
}
