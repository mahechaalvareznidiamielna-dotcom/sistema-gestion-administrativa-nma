import { Injectable, ExecutionContext } from '@nestjs/common';
import { ADMIN_SIMULADO } from './auth.service';

@Injectable()
export class JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { ...ADMIN_SIMULADO };
    return true;
  }
}
