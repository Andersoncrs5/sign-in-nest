import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'gd4b6rb7478bc1fgcn4031478tcb4ydhr47t947gf47tg437fcgc7464rvc1864bcgfy03fev',
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}
