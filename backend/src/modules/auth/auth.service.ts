import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USERS_REPOSITORY, SESSIONS_REPOSITORY } from '../../common/constants/tokens';
import { sha256 } from '../../common/utils/crypto';
import { verifyPassword } from '../../common/utils/password';
import { UsersRepository } from '../users/repositories/users.repository';
import { AuthTokens, JwtPayload } from './auth.types';
import { SessionsRepository } from './repositories/sessions.repository';

export interface DeviceContext {
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthService {
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USERS_REPOSITORY) private readonly usersRepo: UsersRepository,
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionsRepo: SessionsRepository,
  ) {
    this.accessTtl = this.configService.get<number>('jwt.accessTtlSeconds') ?? 900;
    this.refreshTtl =
      this.configService.get<number>('jwt.refreshTtlSeconds') ?? 2592000;
    this.accessSecret =
      this.configService.get<string>('jwt.accessSecret') ?? '';
    this.refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ?? '';
  }

  async login(
    identifier: string,
    password: string,
    device: DeviceContext,
  ): Promise<AuthTokens> {
    const user = await this.usersRepo.findByEmailOrPhone(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);
    const refreshTokenHash = sha256(refreshToken);

    await this.sessionsRepo.create({
      userId: user.id,
      refreshTokenHash,
      deviceId: device.deviceId ?? null,
      ipAddress: device.ipAddress ?? null,
      userAgent: device.userAgent ?? null,
      expiresAt: new Date(Date.now() + this.refreshTtl * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTtl,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const refreshTokenHash = sha256(refreshToken);
    const session = await this.sessionsRepo.findByTokenHash(refreshTokenHash);

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.signAccessToken(payload);
    const newRefreshToken = await this.signRefreshToken(payload);
    const newHash = sha256(newRefreshToken);

    await this.sessionsRepo.rotate(
      session.id,
      newHash,
      new Date(Date.now() + this.refreshTtl * 1000),
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.accessTtl,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = sha256(refreshToken);
    const session = await this.sessionsRepo.findByTokenHash(refreshTokenHash);
    if (!session) {
      return;
    }

    await this.sessionsRepo.revoke(session.id);
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessTtl,
    });
  }

  private async signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshTtl,
    });
  }
}
