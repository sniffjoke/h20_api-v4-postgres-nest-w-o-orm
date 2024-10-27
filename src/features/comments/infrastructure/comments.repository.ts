import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostCreateModel, PostCreateModelWithParams } from '../../posts/api/models/input/create-post.input.model';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';
import { CommentatorInfoModel, LikesInfo } from '../api/models/output/comment.view.model';


@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async createComment(comment: CommentCreateModel, commentatorInfo: CommentatorInfoModel, postId: string) {
    const newPost = await this.dataSource.query(
      `
                    INSERT INTO comments (
                      "content", 
                      "commentatorInfoUserId", 
                      "commentatorInfoUserLogin",
                      "postId" 
                      )
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
          `,
      [
        comment.content,
        commentatorInfo.userId,
        commentatorInfo.userLogin,
        postId
      ],
    );
    return newPost[0].id;
  }

  async findCommentById(id: string) {
    const findedComment = await this.dataSource.query(
      `
                    SELECT * 
                    FROM comments 
                    WHERE "id" = $1          
          `,
      [id],
    );
    if (!findedComment.length) {
      throw new NotFoundException(`Could not find comment with id ${id}`);
    }
    return findedComment[0];
  }

  async updateComment(commentId: string, dto: CommentCreateModel) {
    const updateComment = await this.dataSource.query(
      `
                    UPDATE comments
                    SET "content" = $1
                    WHERE "id" = $2          
          `,
      [
        dto.content,
        commentId
      ],
    );
    return updateComment;
  }

  async deleteComment(commentId: string) {
    const deleteComment = await this.dataSource.query(
      `
                    DELETE FROM comments 
                    WHERE "id" = $1
                `,
      [commentId],
    );
    return deleteComment;
  }

}
