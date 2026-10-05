import { Injectable, ExecutionContext } from '@nestjs/common';

// ─────────────────────────────────────────────────────────────
// MODO SIMULADO: Guard siempre aprueba, inyecta admin fijo
// ─────────────────────────────────────────────────────────────
@Injectable()
export class JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // Inyectar usuario admin simulado para que req.user esté disponible
    req.user = { id: 1, email: 'admin@papeleria.com', nombre: 'Nidia Milena Mahecha' };
    return true;
  }
}

