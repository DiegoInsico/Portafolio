import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token desde el header de autorización
      ignoreExpiration: false, // No ignora la expiración del token
      secretOrKey: configService.get<string>('JWT_SECRET'), // Usa el secreto definido en variables de entorno
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.correo };
  }
}