import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query, Req,
    UseGuards,
} from '@nestjs/common';
import {BlogsService} from "../application/blogs.service";
import {BlogsQueryRepository} from "../infrastructure/blogs.query-repository";
import {BlogCreateModel} from "./models/input/create-blog.input.model";
import { PostCreateModelWithParams } from '../../posts/api/models/input/create-post.input.model';
import {PostsService} from "../../posts/application/posts.service";
import {PostsQueryRepository} from "../../posts/infrastructure/posts.query-repository";
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import {Request} from 'express';

@Controller()
export class BlogsController {
    constructor(
        private readonly blogsService: BlogsService,
        private readonly blogsQueryRepository: BlogsQueryRepository,
        private readonly postsService: PostsService,
        private readonly postsQueryRepository: PostsQueryRepository
    ) {}

    @Get('blogs')
    async getAll(@Query() query: any) {
        const blogsWithQuery = await this.blogsQueryRepository.getAllBlogsWithQuery(query)
        return blogsWithQuery
    }

    @Get('sa/blogs')
    @UseGuards(BasicAuthGuard)
    async getAllBlogs(@Query() query: any) {
        const blogsWithQuery = await this.blogsQueryRepository.getAllBlogsWithQuery(query)
        return blogsWithQuery
    }

    @Post('sa/blogs')
    @UseGuards(BasicAuthGuard)
    async createBlog(@Body() dto: BlogCreateModel) {
        const blogId = await this.blogsService.createBlog(dto)
        const newBlog = await this.blogsQueryRepository.blogOutput(blogId)
        return newBlog
    }

    @Get('blogs/:id')
    async getBlogById(@Param('id') id: string) {
        const blog = await this.blogsQueryRepository.blogOutput(id)
        return blog
    }

    @Put('sa/blogs/:id')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async updateBlogById(@Param('id') id: string, @Body() dto: BlogCreateModel) {
        const updateBlog = await this.blogsService.updateBlog(id, dto)
        return updateBlog
    }

    @Delete('sa/blogs/:id')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async deleteBlog(@Param('id') id: string) {
        const deleteBlog = await this.blogsService.deleteBlog(id)
        return deleteBlog
    }

    @Get('blogs/:id/posts')
    async getAllPostsByBlogId(@Param('id') id: string, @Query() query: any, @Req() req: Request) {
        const posts = await this.postsQueryRepository.getAllPostsWithQuery(query, id)
        const newData = await this.postsService.generatePostsWithLikesDetails(posts.items, req.headers.authorization as string)
        return {
            ...posts,
            items: newData
        };
    }

    @Get('sa/blogs/:id/posts')
    async getAllPostsWithBlogId(@Param('id') id: string, @Query() query: any, @Req() req: Request) {
        const posts = await this.postsQueryRepository.getAllPostsWithQuery(query, id)
        const newData = await this.postsService.generatePostsWithLikesDetails(posts.items, req.headers.authorization as string)
        return {
            ...posts,
            items: newData
        };
    }

    @Post('sa/blogs/:id/posts')
    @UseGuards(BasicAuthGuard)
    async createPostWithParams(@Body() dto: PostCreateModelWithParams, @Param('id') blogId: string, @Req() req: Request) {
        const postId = await this.postsService.createPost({...dto, blogId});
        const newPost = await this.postsQueryRepository.postOutput(postId);
        const postWithDetails = await this.postsService.generateOnePostWithLikesDetails(newPost, req.headers.authorization as string)
        return postWithDetails;
    }

    @Put('sa/blogs/:blogId/posts/:postId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async updatePost(@Body() dto: PostCreateModelWithParams, @Param() idParams: any) {
        const updatePost = await this.blogsService.updatePostFromBlogsUri(idParams.postId, idParams.blogId, dto);
        console.log(updatePost);
        return updatePost
    }

    @Delete('sa/blogs/:blogId/posts/:postId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async deletePost(@Param() idParams: any) {
        const deletePost = await this.blogsService.deletePostFromBlogsUri(idParams.postId, idParams.blogId);
        return deletePost
    }

}
