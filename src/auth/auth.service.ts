import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

// ─────────────────────────────────────────────────────────────
// MODO SIMULADO: Auth sin base de datos real
// Credenciales fijas: admin@papeleria.com / Admin123
// ─────────────────────────────────────────────────────────────

const ADMIN_SIMULADO = {
  id: 1,
  nombre: 'Nidia Milena Mahecha',
  email: 'admin@papeleria.com',
  password: 'Admin123',
};

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(dto: LoginDto) {
    const emailOk = dto.email.toLowerCase() === ADMIN_SIMULADO.email;
    const passOk = dto.password === ADMIN_SIMULADO.password;
    if (!emailOk || !passOk) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.emitirToken(
      ADMIN_SIMULADO.id,
      ADMIN_SIMULADO.email,
      ADMIN_SIMULADO.nombre,
    );
  }

  async perfil(_id: number) {
    return {
      id: ADMIN_SIMULADO.id,
      nombre: ADMIN_SIMULADO.nombre,
      email: ADMIN_SIMULADO.email,
    };
  }

  async actualizarPerfil(_id: number, dto: ActualizarPerfilDto) {
    // En modo simulado solo actualizamos en memoria temporalmente
    const nombre = dto.nombre ?? ADMIN_SIMULADO.nombre;
    const email = dto.email?.toLowerCase() ?? ADMIN_SIMULADO.email;
    ADMIN_SIMULADO.nombre = nombre;
    ADMIN_SIMULADO.email = email;
    if (dto.password) {
      ADMIN_SIMULADO.password = dto.password;
    }
    return this.emitirToken(ADMIN_SIMULADO.id, email, nombre);
  }

  private emitirToken(id: number, email: string, nombre: string) {
    const accessToken = this.jwt.sign({ sub: id, email, nombre });
    return { accessToken, usuario: { id, nombre, email } };
  }
}
