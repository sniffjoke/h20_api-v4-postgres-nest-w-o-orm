import { Injectable, NotFoundException } from '@nestjs/common';
import {CommentViewModel} from "../api/models/output/comment.view.model";
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class CommentsQueryRepository {
    constructor(
      @InjectDataSource() private readonly dataSource: DataSource
    ) {
    }

    async getAllCommentsByPostId(postId: string) {
        // const comments = await this.commentModel.find({postId})
        // return comments.map(comment => this.commentOutputMap(comment as unknown as HydratedDocument<CommentViewModel>))
    }

    async getAllCommentByPostIdWithQuery(query: any, postId: string) {
        const generateQuery = await this.generateQuery(query, postId)
        const findedPost = await this.dataSource.query(
          `
                    SELECT *
                    FROM posts
                    WHERE "id" = $1
          `,
          [postId]
        )
        if (!findedPost.length) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }
        const comments = await this.dataSource.query(
          `
                SELECT * 
                FROM comments 
                WHERE "postId"=$1
                ORDER BY "${generateQuery.sortBy}" ${generateQuery.sortDirection}
                OFFSET $2
                LIMIT $3         
          `,
          [
              postId,
              (generateQuery.page - 1) * generateQuery.pageSize,
              generateQuery.pageSize,
          ],
        )
        // if (!post) {
        //     throw new NotFoundException("Post not found")
        // }
        // const items = await this.commentModel
        //   .find({postId})
        //   .sort({[generateQuery.sortBy]: generateQuery.sortDirection})
        //   .limit(generateQuery.pageSize)
        //   .skip((generateQuery.page - 1) * generateQuery.pageSize)
        const commentsOutput = comments.map(item => this.commentOutputMap(item))
        const resultPosts = new PaginationBaseModel<CommentViewModel>(generateQuery, commentsOutput)
        return resultPosts
    }

    private async generateQuery(query: any, postId: string) {
        // const totalCount = await this.commentModel.countDocuments({postId})
        const totalCount = await this.dataSource.query(
          `
                SELECT COUNT(*) 
                FROM comments 
                WHERE "postId"=$1
            `,
          [
            postId
          ],
        )

        const pageSize = query.pageSize ? +query.pageSize : 10;
        const pagesCount = Math.ceil(Number(totalCount[0].count) / pageSize);
        return {
            totalCount: Number(totalCount[0].count),
            pageSize,
            pagesCount,
            page: query.pageNumber ? Number(query.pageNumber) : 1,
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc'
        }
    }



    async commentOutput(id: string) {
        const findedComment = await this.dataSource.query(
          `
                    SELECT * FROM comments 
                    WHERE "id" = $1          
          `,
          [id]
        )
        if (!findedComment.length) {
            throw new NotFoundException("Comment not found")
        }
        return this.commentOutputMap(findedComment[0])
    }

    commentOutputMap(comment: any) {
        // if (!comment) {
        //     throw new NotFoundException("Comment not found")
        // }
        const {id, content, commentatorInfoUserId, commentatorInfoUserLogin, likesInfoLikesCount, likesInfoDislikesCount, createdAt} = comment
        return {
            id: id.toString(),
            content,
            commentatorInfo: {
                userId: commentatorInfoUserId,
                userLogin: commentatorInfoUserLogin
            },
            likesInfo: {
                likesCount: likesInfoLikesCount,
                dislikesCount: likesInfoDislikesCount
            },
            createdAt
        }
    }

}