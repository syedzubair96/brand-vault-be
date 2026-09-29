import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

interface FakeUser {
  id: number;
  UserName: string;
  email: string;
  Password: string;
  RefreshTokenHash: string | null;
}

function createFakePrisma() {
  const users: FakeUser[] = [];
  const find = (where: Partial<FakeUser>) =>
    users.find((u) => (where.id ? u.id === where.id : u.email === where.email)) ?? null;

  return {
    users: {
      create: async ({ data }: { data: Omit<FakeUser, 'id' | 'RefreshTokenHash'> }) => {
        if (users.some((u) => u.email === data.email)) {
          const { Prisma } = await import('../generated/prisma/client.js');
          throw new Prisma.PrismaClientKnownRequestError('duplicate', {
            code: 'P2002',
            clientVersion: 'test',
          });
        }
        const user = { ...data, id: users.length + 1, RefreshTokenHash: null };
        users.push(user);
        return user;
      },
      findUnique: async ({ where }: { where: Partial<FakeUser> }) => find(where),
      update: async ({ where, data }: { where: Partial<FakeUser>; data: Partial<FakeUser> }) =>
        Object.assign(find(where)!, data),
      updateMany: async ({ where, data }: { where: Partial<FakeUser>; data: Partial<FakeUser> }) => {
        const user = find(where);
        if (user) Object.assign(user, data);
        return { count: user ? 1 : 0 };
      },
    },
  };
}

const config = new ConfigService({
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
});

describe('AuthService', () => {
  let service: AuthService;
  const credentials = { UserName: 'demo', email: 'demo@brandvault.dev', password: 'Demo1234!' };

  beforeEach(() => {
    const prisma = createFakePrisma() as unknown as PrismaService;
    service = new AuthService(prisma, new JwtService(), config);
  });

  it('registers and logs in with the right password only', async () => {
    const registered = await service.register(credentials);
    expect(registered.user).toEqual({ id: 1, UserName: 'demo', email: 'demo@brandvault.dev' });

    const loggedIn = await service.login({ email: credentials.email, password: credentials.password });
    expect(loggedIn.accessToken).toBeTypeOf('string');

    await expect(
      service.login({ email: credentials.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.login({ email: 'nobody@brandvault.dev', password: credentials.password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a duplicate email', async () => {
    await service.register(credentials);
    await expect(service.register(credentials)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rotates refresh tokens and revokes the session when an old one is reused', async () => {
    const first = await service.register(credentials);
    const second = await service.refresh(first.refreshToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);

    await expect(service.refresh(first.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refresh(second.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an access token used as a refresh token', async () => {
    const session = await service.register(credentials);
    await expect(service.refresh(session.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logout makes the refresh token unusable', async () => {
    const session = await service.register(credentials);
    await service.logout(session.user.id);
    await expect(service.refresh(session.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
