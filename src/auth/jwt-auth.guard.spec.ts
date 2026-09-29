import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const config = new ConfigService({ JWT_ACCESS_SECRET: 'test-access-secret' });
const jwt = new JwtService();

function contextFor(authorization?: string, isPublic = false) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const handler = () => undefined;
  if (isPublic) Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
  const context = {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('JwtAuthGuard', () => {
  const guard = new JwtAuthGuard(jwt, config, new Reflector());

  it('lets public routes through without a token', async () => {
    const { context } = contextFor(undefined, true);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects requests without a bearer token', async () => {
    const { context } = contextFor();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a valid access token and exposes the user', async () => {
    const token = await jwt.signAsync(
      { sub: 7, email: 'demo@brandvault.dev' },
      { secret: 'test-access-secret', expiresIn: '1m' },
    );
    const { context, request } = contextFor(`Bearer ${token}`);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 7, email: 'demo@brandvault.dev' });
  });

  it('rejects a token signed with another secret, such as a refresh token', async () => {
    const token = await jwt.signAsync({ sub: 7 }, { secret: 'test-refresh-secret', expiresIn: '1m' });
    const { context } = contextFor(`Bearer ${token}`);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
