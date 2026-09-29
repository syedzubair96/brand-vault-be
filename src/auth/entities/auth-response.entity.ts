import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user' })
  UserName: string;

  @ApiProperty({ example: 'user@abc.dev' })
  email: string;
}

export class AuthResponse {
  @ApiProperty({ description: 'Short-lived token for the Authorization: Bearer header' })
  accessToken: string;

  @ApiProperty({ description: 'Long-lived token for POST /auth/refresh. Each refresh returns a new one.' })
  refreshToken: string;

  @ApiProperty({ type: AuthUserResponse })
  user: AuthUserResponse;
}
