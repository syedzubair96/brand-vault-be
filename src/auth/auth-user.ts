export interface AuthUser {
  id: number;
  email: string;
}

export interface AccessTokenPayload {
  sub: number;
  email: string;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
}
