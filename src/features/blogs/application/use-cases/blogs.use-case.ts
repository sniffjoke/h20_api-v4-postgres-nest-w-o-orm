import { BlogsService } from '../blogs.service';
import { Injectable } from '@nestjs/common';


@Injectable()
export class CreateBlogUseCase {

  constructor(
    private readonly blogsService: BlogsService
  ) {
  }

  async execute() {
    // create blog
  }

  // async private calculateStaus() {
  //
  // }
}
