import { forwardRef, Module } from "@nestjs/common";
import { PostsController } from "./api/posts.controller";
import { PostsService } from "./application/posts.service";
import { PostsRepository } from "./infrastructure/posts.repository";
import { PostsQueryRepository } from "./infrastructure/posts.query-repository";
import { BlogsModule } from "../blogs/blogs.module";
import { CommentsModule } from "../comments/comments.module";
import { UsersModule } from '../users/users.module';
import { TokensService } from '../tokens/application/tokens.service';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    forwardRef(() => BlogsModule),
    CommentsModule,
    UsersModule,
    LikesModule
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    TokensService,
  ],
  exports: [
    forwardRef(() => BlogsModule),
    PostsService,
    PostsRepository,
    PostsQueryRepository
  ],
})
export class PostsModule {}
