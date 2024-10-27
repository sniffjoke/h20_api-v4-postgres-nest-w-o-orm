import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../tokens/application/tokens.service';
import { LoginDto } from '../api/models/input/auth.input.model';
import { CryptoService } from '../../../core/modules/crypto/application/crypto.service';
import { UuidService } from 'nestjs-uuid';
import { DevicesService } from '../../devices/application/devices.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { DevicesRepository } from '../../devices/infrastructure/devices.repository';
import { TokensRepository } from '../../tokens/infrastructure/tokens.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokensService: TokensService,
    private readonly cryptoService: CryptoService,
    private readonly uuidService: UuidService,
    private readonly devicesService: DevicesService,
    private readonly devicesRepository: DevicesRepository,
    private readonly tokensRepository: TokensRepository,
  ) {
  }

  async login(loginDto: LoginDto, myIp: string, userAgent: string) {
    const findedUser = await this.usersRepository.findUserByLogin(loginDto.loginOrEmail);
    const comparePass = await this.cryptoService.comparePassword(loginDto.password, findedUser.password);
    if (!comparePass) {
      throw new UnauthorizedException('Password not match');
    }
    const findSession = await this.devicesRepository.findManyDevices({
      userId: findedUser.id,
      ip: myIp,
      title: userAgent,
    });
    const deviceData: any = {
      userId: findedUser.id,
      deviceId: findSession ? findSession.deviceId : this.uuidService.generate(),
      ip: myIp,
      title: userAgent,
      lastActiveDate: new Date(Date.now()).toISOString(),
    };
    const {
      accessToken,
      refreshToken,
    } = this.tokensService.createTokens(findedUser.id, deviceData.deviceId);
    if (findSession) {
      await this.devicesRepository.updateDeviceById(findSession.id, new Date(Date.now()).toISOString());
      const tokenData = {
        userId: findedUser.id,
        refreshToken,
        blackList: false,
        deviceId: findSession.deviceId,
      };
      await this.tokensRepository.createToken(tokenData);
    } else {
      const newDevice = await this.devicesService.createSession(deviceData);
      const tokenData = {
        userId: findedUser.id,
        refreshToken,
        blackList: false,
        deviceId: deviceData.deviceId,
      };
      await this.tokensRepository.createToken(tokenData);
    }
    return {
      accessToken,
      refreshToken,
    };
  }

  async getMe(bearerHeader: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const validateToken = this.tokensService.validateAccessToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid access token');
    }
    const findedUser = await this.usersRepository.findUserById(validateToken._id);
    if (!findedUser) {
      throw new UnauthorizedException('User not exists');
    }
    return {
      email: findedUser.email,
      login: findedUser.login,
      userId: `${findedUser.id}`,
    };
  }

  async refreshToken(tokenHeaderR: any) {
    const token = this.tokensService.getTokenFromCookie(tokenHeaderR);
    const tokenValidate: any = this.tokensService.validateRefreshToken(token);
    if (!tokenValidate) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isTokenExists: any = await this.tokensRepository.findTokenByRToken({ refreshToken: token });
    if (!isTokenExists || isTokenExists.blackList) {
      throw new UnauthorizedException('Refresh token not valid');
    }
    const updateTokenInfo = await this.tokensRepository.updateStatusRTokensInDb({ refreshToken: isTokenExists.refreshToken });
    if (!updateTokenInfo.length) {
      throw new UnauthorizedException('Something went wrong');
    }
    const { refreshToken, accessToken } = this.tokensService.createTokens(isTokenExists.userId, tokenValidate.deviceId);
    const tokenData = {
      userId: isTokenExists.userId,
      refreshToken,
      blackList: false,
      deviceId: isTokenExists.deviceId,
    };
    const addTokenToDb = await this.tokensRepository.createToken(tokenData);
    if (!addTokenToDb.length) {
      throw new UnauthorizedException('Unfortunate to refresh token');
    }
    const findSessionAndUpdate = await this.devicesRepository.updateDeviceByIdAndByDeviceId(
      isTokenExists.userId,
      isTokenExists.deviceId,
      new Date(Date.now()).toISOString(),
    );
    if (!findSessionAndUpdate.length) {
      throw new UnauthorizedException('Not updated session');
    }
    return {
      refreshToken,
      accessToken,
    };

  }

  async logoutUser(tokenHeaderR: any) {
    const token = this.tokensService.getTokenFromCookie(tokenHeaderR);
    const tokenValidate: any = this.tokensService.validateRefreshToken(token);
    if (!tokenValidate) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isTokenExists: any = await this.tokensRepository.findTokenByRToken({ refreshToken: token });
    if (!isTokenExists || isTokenExists.blackList) {
      throw new UnauthorizedException('Refresh token not valid');
    }
    const updateTokenInfo = await this.tokensRepository.updateStatusTokensInDb({deviceId: tokenValidate.deviceId});
    if (!updateTokenInfo.length) {
      throw new UnauthorizedException('Something went wrong');
    }
    const updateDevices = await this.devicesRepository.deleteDeviceByDeviceId({ deviceId: tokenValidate.deviceId });
    if (!updateDevices.length) {
      throw new UnauthorizedException('Unfortunately to update devices');
    }
    return updateDevices;
  }

}
