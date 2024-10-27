import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Request, Response } from 'express';
import {
  EmailActivateDto,
  LoginDto,
  ResendActivateCodeDto,
} from './models/input/auth.input.model';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserAgent } from '../../../core/decorators/common/user-agent.decorator';
import ip from 'ip'
import { CreateUserDto } from '../../users/api/models/input/create-user.dto';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repositories';
import { UsersService } from '../../users/application/users.service';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const userData = await this.authService.getMe(req.headers.authorization as string);
    return userData;
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @UserAgent() userAgent: string,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto, ip.address() as string, userAgent);
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @Post('registration')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async register(@Body() createUserDto: CreateUserDto) {
    const userId = await this.usersService.createUser(createUserDto, false);
    const newUser = await this.usersQueryRepository.userOutput(userId);
    return newUser;
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const { refreshToken, accessToken } = await this.authService.refreshToken(req.cookies);
    response.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const logoutUser = await this.authService.logoutUser(req.cookies);
    response.clearCookie('refreshToken');
    return logoutUser;
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async activateEmail(@Body() dto: EmailActivateDto) {
    const activateEmail = await this.usersService.activateEmail(dto.code);
    return activateEmail;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  async resendEmail(@Body() dto: ResendActivateCodeDto) {
    return await this.usersService.resendEmail(dto.email);
  }

  // @Post('password-recovery')
  // @HttpCode(204)
  // async passwordRecovery(@Body() dto: PasswordRecoveryDto) {
  //   return await this.usersService.passwordRecovery(dto.email);
  // }
  //
  // @Post('new-password')
  // async newPasswordApprove(@Body() recoveryPasswordData: RecoveryPasswordModel) {
  //   return await this.usersService.approveNewPassword(recoveryPasswordData);
  // }

}
