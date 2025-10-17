import { Injectable } from '@nestjs/common';
import { JwtStrategy } from 'src/modules/auth/jwt.strategy';

@Injectable()
export class WebsocketAuthService {
  constructor(private jwtStrategy: JwtStrategy) {}

  async validateWebSocketToken(token: string) {
    try {
      const decoded = await this.jwtStrategy.validate({ id: token });
      return decoded;
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }
}
