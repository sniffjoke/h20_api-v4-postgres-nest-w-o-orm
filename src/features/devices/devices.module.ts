import { Module } from '@nestjs/common';
import { DevicesService } from "./application/devices.service";
import { DevicesController } from './api/devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesRepository } from './infrastructure/devices.repository';
import { TokensModule } from '../tokens/tokens.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TokensModule,
    TypeOrmModule.forFeature([]),
  ],
  controllers: [DevicesController],
  providers: [
    DevicesService,
    DevicesRepository,
  ],
  exports: [
    DevicesService,
    DevicesRepository,
  ]
})
export class DevicesModule {}
