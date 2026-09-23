import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.findByEmail(dto.email.toLowerCase());
    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const ok = await bcrypt.compare(dto.password, usuario.password);
    if (!ok) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.emitirToken(usuario.id, usuario.email, usuario.nombre);
  }

  async perfil(id: number) {
    const usuario = await this.usuarios.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  }

  async actualizarPerfil(id: number, dto: ActualizarPerfilDto) {
    const usuario = await this.usuarios.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const email = dto.email.toLowerCase();
    const otro = await this.usuarios.findByEmail(email);
    if (otro && otro.id !== id) {
      throw new ConflictException('El correo ya está en uso');
    }

    usuario.nombre = dto.nombre;
    usuario.email = email;
    if (dto.password) {
      usuario.password = await bcrypt.hash(dto.password, 10);
    }
    const guardado = await this.usuarios.save(usuario);
    return this.emitirToken(guardado.id, guardado.email, guardado.nombre);
  }

  private emitirToken(id: number, email: string, nombre: string) {
    const accessToken = this.jwt.sign({ sub: id, email, nombre });
    return { accessToken, usuario: { id, nombre, email } };
  }
}
