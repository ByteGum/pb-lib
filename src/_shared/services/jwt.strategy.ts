import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.encryption_key'),
    });
    Logger.log(`key , ${config.get<string>('app.encryption_key')}`);
  }

  async validate(payload: any) {
    Logger.log(`authId , ${payload['authId']}`);
    return {
      ...payload,
    };
  }
}
