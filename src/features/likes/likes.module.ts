import { Module } from '@nestjs/common';
import { LikeHandler } from './domain/like.handler';

@Module({
  imports: [],
  controllers: [],
  providers: [
    LikeHandler
  ],
  exports: [
    LikeHandler
  ]
})
export class LikesModule {}
