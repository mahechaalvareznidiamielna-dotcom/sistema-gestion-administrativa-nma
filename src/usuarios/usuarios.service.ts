import { Injectable } from '@nestjs/common';
import { MemStoreService } from '../mem-store/mem-store.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly store: MemStoreService) {}

  async findByEmail(email: string) {
    return this.store.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findById(id: number) {
    return this.store.usuarios.find(u => u.id === id) ?? null;
  }

  async count() {
    return this.store.usuarios.length;
  }
}
