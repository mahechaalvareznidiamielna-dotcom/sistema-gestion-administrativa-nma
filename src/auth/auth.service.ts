import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

export const ADMIN_SIMULADO = {
  id: 1,
  nombre: 'Nidia Milena Mahecha',
  email: 'admin@papeleria.com',
};

const TOKEN_BYPASS = 'bypass-nma';

@Injectable()
export class AuthService {
  async login(_dto: LoginDto) {
    return this.sesion();
  }

  async perfil(_id?: number) {
    return { ...ADMIN_SIMULADO };
  }

  async actualizarPerfil(_id: number, dto: ActualizarPerfilDto) {
    if (dto.nombre) ADMIN_SIMULADO.nombre = dto.nombre;
    if (dto.email) ADMIN_SIMULADO.email = dto.email.toLowerCase();
    return this.sesion();
  }

  private sesion() {
    return {
      accessToken: TOKEN_BYPASS,
      usuario: { ...ADMIN_SIMULADO },
    };
  }
}
