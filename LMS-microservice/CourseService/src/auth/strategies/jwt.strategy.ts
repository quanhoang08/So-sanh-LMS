import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'YOUR_SECRET_KEY', // Phải trùng với secret key bên Service User
    });
  }

  async validate(payload: any) {
    // Payload này chứa thông tin từ Token (ví dụ: sub là userId, role,...)
    // Những gì return ở đây sẽ được gán vào req.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}