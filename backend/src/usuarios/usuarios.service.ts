import { Injectable } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { CsvStore, FILES, HEADERS } from '../csv/csv.store';

@Injectable()
export class UsuariosService {
  constructor(private readonly csv: CsvStore) {}

  findByEmail(email: string) {
    return (
      this.csv
        .read<Usuario>(FILES.usuarios)
        .find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
    );
  }

  findById(id: number) {
    return this.csv.read<Usuario>(FILES.usuarios).find((u) => u.id === id) || null;
  }

  create(data: Omit<Usuario, 'id'>) {
    return this.csv.insert<Usuario>(FILES.usuarios, HEADERS.usuarios, data);
  }

  save(usuario: Usuario) {
    return this.csv.update<Usuario>(
      FILES.usuarios,
      HEADERS.usuarios,
      usuario.id,
      usuario,
    );
  }

  count() {
    return this.csv.read<Usuario>(FILES.usuarios).length;
  }
}
