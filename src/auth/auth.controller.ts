import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto || {});
  }

  @Get('login')
  loginGet() {
    return this.auth.login({});
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req) {
    return this.auth.perfil(req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('perfil')
  actualizar(@Req() req, @Body() dto: ActualizarPerfilDto) {
    return this.auth.actualizarPerfil(req.user?.id, dto);
  }
}
