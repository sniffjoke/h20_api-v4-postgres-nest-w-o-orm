import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { SETTINGS } from '../settings/settings';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User not logged in' });
      }
      const user = this.jwtService.verify(token, { secret: SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN });
      req.user = user;
      return true;
    } catch (e: any) {
      throw new UnauthorizedException({ message: 'User not logged in.' });
    }
  }
}
