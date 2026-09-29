import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Prisma, type Users } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth-user.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { AuthResponse } from './entities/auth-response.entity.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      const user = await this.prisma.users.create({
        data: { UserName: dto.UserName, email: dto.email, Password: passwordHash },
      });
      return this.issueTokens(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('That email or user name is already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.users.findUnique({ where: { email: dto.email } });
    const passwordOk = user ? await bcrypt.compare(dto.password, user.Password) : false;
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.users.findUnique({ where: { id: payload.sub } });
    if (!user?.RefreshTokenHash || !this.matchesHash(refreshToken, user.RefreshTokenHash)) {
      // A valid but unknown token means it was already rotated or revoked: revoke the session.
      if (user?.RefreshTokenHash) {
        await this.prisma.users.update({
          where: { id: user.id },
          data: { RefreshTokenHash: null },
        });
      }
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    return this.issueTokens(user);
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.users.updateMany({
      where: { id: userId },
      data: { RefreshTokenHash: null },
    });
  }

  private async issueTokens(user: Users): Promise<AuthResponse> {
    const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email };
    const refreshPayload: RefreshTokenPayload = { sub: user.id, jti: randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '30m') as JwtSignOptions['expiresIn'],
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d') as JwtSignOptions['expiresIn'],
      }),
    ]);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { RefreshTokenHash: this.hashToken(refreshToken) },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, UserName: user.UserName, email: user.email },
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private matchesHash(token: string, storedHash: string) {
    const actual = Buffer.from(this.hashToken(token), 'hex');
    const expected = Buffer.from(storedHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
