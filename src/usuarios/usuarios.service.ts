import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { CsvStore, FILES, HEADERS } from '../csv/csv.store';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    private readonly csv: CsvStore,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    const user = await this.repo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (user) return user;

    // Fallback en CSV si existe
    const csvUser = this.csv
      .read<Usuario>(FILES.usuarios)
      .find((u) => u.email.toLowerCase() === email.toLowerCase());
    return csvUser || null;
  }

  async findById(id: number): Promise<Usuario | null> {
    const user = await this.repo.findOne({ where: { id } });
    if (user) return user;
    return this.csv.read<Usuario>(FILES.usuarios).find((u) => u.id === id) || null;
  }

  async create(data: Omit<Usuario, 'id'>) {
    const user = await this.repo.save(this.repo.create(data));
    try {
      this.csv.insert<Usuario>(FILES.usuarios, HEADERS.usuarios, user);
    } catch {
      // Opcional
    }
    return user;
  }

  async save(usuario: Usuario) {
    const updated = await this.repo.save(usuario);
    try {
      this.csv.update<Usuario>(
        FILES.usuarios,
        HEADERS.usuarios,
        usuario.id,
        updated,
      );
    } catch {
      // Opcional
    }
    return updated;
  }

  async count() {
    return this.repo.count();
  }
}
