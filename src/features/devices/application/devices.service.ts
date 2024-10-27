import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from '../../tokens/application/tokens.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { TokensRepository } from '../../tokens/infrastructure/tokens.repository';

@Injectable()
export class DevicesService {
  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensRepository: TokensRepository,
    private readonly usersRepository: UsersRepository,
    private readonly devicesRepository: DevicesRepository,
  ) {
  }

  async createSession(deviceData: any) {
    const newDevice = await this.devicesRepository.createSession(deviceData);
    return newDevice;
  }

  async getDevices(bearerHeaderR: string) {
    const token = this.tokensService.getTokenFromCookie(bearerHeaderR);
    const validateToken: any = this.tokensService.validateRefreshToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersRepository.findUserById(validateToken._id);
    const devices = await this.devicesRepository.findDeviceByUserId({ userId: user.id });
    const deviceMap = (device: any) => ({
      deviceId: device.deviceId,
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
    });
    const devicesOutput = devices.map((device) => {
      return deviceMap(device);
    });
    return devicesOutput;
  }

  async deleteDeviceByDeviceIdField(bearerHeaderR: string, deviceId: string) {
    const token = this.tokensService.getTokenFromCookie(bearerHeaderR);
    const validateToken: any = this.tokensService.validateRefreshToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const findToken = await this.tokensRepository.findToken({ deviceId });
    if (validateToken._id.toString() !== findToken?.userId) {
      throw new ForbiddenException('Not your device');
    }
    const findSession = await this.devicesRepository.findDeviceByDeviceId({ deviceId });
    await this.devicesRepository.deleteDeviceByDeviceId({ deviceId });
    const updateTokensInfo = await this.tokensRepository.updateStatusTokensInDb({ deviceId });
    if (!updateTokensInfo) {
      throw new UnauthorizedException('Unknown Error');
    }
    return updateTokensInfo;
  }

  async deleteAllDevicesExceptCurrent(bearerHeaderR: string) {
    const token = this.tokensService.getTokenFromCookie(bearerHeaderR);
    const validateToken: any = this.tokensService.validateRefreshToken(token);
    if (!validateToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersRepository.findUserById(validateToken._id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.devicesRepository.deleteAllDevicesExceptCurrent({
      userId: user.id, deviceId: validateToken.deviceId,
    });
    const updateTokensInfo = await this.tokensRepository.updateStatusTokensAfterDeleteAllInDb({
      userId: validateToken._id,
      deviceId: validateToken.deviceId,
    });
    if (!updateTokensInfo) {
      throw new UnauthorizedException('Unknown Error');
    }
    return updateTokensInfo;
  }

}
