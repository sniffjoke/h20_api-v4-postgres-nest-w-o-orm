import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts.service';


@Injectable()
export class PostsUseCase {
  constructor(
    private readonly postsService: PostsService,
  ) {
  }

  async execute(post: any) {

  }

}
