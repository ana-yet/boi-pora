import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DEV_JWT_FALLBACK_SECRET } from '../../../common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || DEV_JWT_FALLBACK_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel
      .findById(payload.sub)
      .select('_id email role')
      .lean()
      .exec();
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }
}
