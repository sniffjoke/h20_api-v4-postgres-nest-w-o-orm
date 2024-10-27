import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SETTINGS } from "../../../core/settings/settings";

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService
  ) {
  }

  createTokens(userId: string, deviceId?: string) {
    const [accessToken, refreshToken] = [
      this.jwtService.sign(
        {
          _id: userId
        },
        {
          secret: SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN,
          expiresIn: "1000s"
        }
      ),
      this.jwtService.sign(
        {
          _id: userId,
          deviceId
        },
        {
          secret: SETTINGS.VARIABLES.JWT_SECRET_REFRESH_TOKEN,
          expiresIn: "2000s"
        }
      )
    ];
    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token: string) {
    try {
      const userData = this.jwtService.verify(
        token,
        { secret: SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN }
      );
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData = this.jwtService.verify(
        token,
        { secret: SETTINGS.VARIABLES.JWT_SECRET_REFRESH_TOKEN }
      );
      return userData;
    } catch (e) {
      return null;
    }
  }
  getToken(bearerHeader: string) {
    const token = bearerHeader.split(" ")[1];
    return token;
  }

  getTokenFromCookie(bearerHeaderR: any) {
    const tokenValue = Object.values(bearerHeaderR)
    return tokenValue[0] as string;
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

}
