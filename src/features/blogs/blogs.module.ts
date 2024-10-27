import { Module } from "@nestjs/common";
import { BlogsController } from "./api/blogs.controller";
import { BlogsService } from "./application/blogs.service";
import { BlogsRepository } from "./infrastructure/blogs.repository";
import { BlogsQueryRepository } from "./infrastructure/blogs.query-repository";
import { PostsModule } from "../posts/posts.module";

@Module({
  imports: [
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
  ],
  exports: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository
  ]
})
export class BlogsModule {
}
