import {Injectable} from '@nestjs/common';
import {BlogsRepository} from "../infrastructure/blogs.repository";
import {BlogCreateModel} from "../api/models/input/create-blog.input.model";
import { PostCreateModelWithParams } from '../../posts/api/models/input/create-post.input.model';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class BlogsService {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly postsRepository: PostsRepository
    ) {
    }

    async createBlog(blog: BlogCreateModel) {
        const newBlogId = await this.blogsRepository.create(blog)
        return newBlogId
    }

    async updateBlog(id: string, dto: BlogCreateModel) {
        const blog = await this.blogsRepository.findBlogById(id)
        const updateBlog = await this.blogsRepository.updateBlogById(blog.id, dto)
        return updateBlog
    }

    async deleteBlog(id: string) {
        const findedBlog = await this.blogsRepository.findBlogById(id)
        const deleteBlog = await this.blogsRepository.deleteBlog(id)
        return deleteBlog
    }

    async updatePostFromBlogsUri(postId: string, blogId: string, dto: PostCreateModelWithParams) {
        const findedBlog = await this.blogsRepository.findBlogById(blogId)
        const updatePost = await this.postsRepository.updatePostFromBlogsUri(postId, blogId, dto)
        return updatePost
    }

    async deletePostFromBlogsUri(postId: string, blogId: string) {
        const findedBlog = await this.blogsRepository.findBlogById(blogId)
        const updatePost = await this.postsRepository.deletePostFromBlogsUri(postId, blogId)
        return updatePost
    }

}

// метод execute pattern
// async createBlog(blog: BlogCreateModel): Promise<string> {
    //
    // const newBlog = this.blogModel.creatBlog(blog)
    // newBlog.updateBlog()
    // const saveData = await this.blogsRepository.saveBlog(newBlog)
    // return saveData._id.toString()
// }
