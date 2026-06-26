import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const provided = req.headers['x-internal-token'];
    const expected = process.env.INTERNAL_TOKEN ?? 'shopforge_internal';
    if (provided !== expected) throw new UnauthorizedException('Invalid internal token');
    return true;
  }
}
