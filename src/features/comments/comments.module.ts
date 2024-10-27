import { forwardRef, Module } from "@nestjs/common";
import { CommentsController } from "./api/comments.controller";
import { CommentsService } from "./application/comments.service";
import { CommentsRepository } from "./infrastructure/comments.repository";
import { CommentsQueryRepository } from "./infrastructure/comments.query-repository";
import { PostsModule } from "../posts/posts.module";
import { UsersModule } from '../users/users.module';
import { TokensService } from '../tokens/application/tokens.service';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UsersCheckHandler } from '../users/domain/users.check-handler';

@Module({
  imports: [
    forwardRef(() => PostsModule),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    TokensService,
    UsersRepository,
    UsersCheckHandler
  ],
  exports: [
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository
  ]
})
export class CommentsModule {
}
