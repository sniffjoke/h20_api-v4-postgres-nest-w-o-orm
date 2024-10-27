import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';
import { TokensService } from '../../tokens/application/tokens.service';
import { CommentViewModel } from '../api/models/output/comment.view.model';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { LikeStatus } from '../../posts/api/models/output/post.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersCheckHandler } from '../../users/domain/users.check-handler';

@Injectable()
export class CommentsService {
  constructor(
    private readonly tokensService: TokensService,
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly usersCheckHandler: UsersCheckHandler,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async createComment(commentDto: CommentCreateModel, postId: string, bearerHeader: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken = this.tokensService.decodeToken(token);
    const user = await this.usersRepository.findUserById(decodedToken._id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const findedPost = await this.postsRepository.findPostById(postId);
    const newCommentId = await this.commentsRepository.createComment(
      commentDto,
      { userId: user.id, userLogin: user.login },
      postId,
    );
    return newCommentId;
  }

  async updateCommentById(id: string, dto: CommentCreateModel, bearerHeader: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken = this.tokensService.decodeToken(token);
    const findedComment = await this.commentsRepository.findCommentById(id);
    const isOwner = this.usersCheckHandler.checkIsOwner(findedComment.commentatorInfoUserId, decodedToken._id.toString());
    if (isOwner) {
      const updateComment = await this.commentsRepository.updateComment(id, dto);
      return updateComment;
    }
  }

  async deleteCommentById(id: string, bearerHeader: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken = this.tokensService.decodeToken(token);
    const findedComment = await this.commentsRepository.findCommentById(id);
    const isOwner = this.usersCheckHandler.checkIsOwner(findedComment.commentatorInfoUserId, decodedToken._id.toString());
    if (isOwner) {
      const deleteComment = await this.commentsRepository.deleteComment(id);
      return deleteComment;
    }
  }

  async updateCommentByIdWithLikeStatus(bearerHeader: string, commentId: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken: any = this.tokensService.validateAccessToken(token);
    const user = await this.usersRepository.findUserById(decodedToken?._id);
    const findedComment = await this.commentsRepository.findCommentById(commentId);
    return {
      findedComment,
      user,
    };
  }

  async generateCommentsData(items: CommentViewModel[], bearerHeader: string) {
    const commentsMap = await Promise.all(items.map(async (item) => {
        return this.generateNewCommentData(item, bearerHeader);
      }),
    );
    return commentsMap;
  }

  async generateNewCommentData(item: any, bearerHeader: string) {
    let user;
    if (bearerHeader) {
      try {
        const token = this.tokensService.getToken(bearerHeader);
        const decodedToken = this.tokensService.decodeToken(token);
        user = await this.usersRepository.findUserByIdOrNull(decodedToken._id);
      } catch {
        user = null;
      }
    } else {
      user = null;
    }
    const likeStatus = await this.dataSource.query(
      `
            SELECT "status"
            FROM likes
            WHERE "commentId" = $1 AND "userId" = $2  
      `,
      [item.id, user?.id],
    );
    const myStatus = user && likeStatus.length ? likeStatus[0].status : LikeStatus.None;
    const newCommentData = this.addStatusPayload(item, myStatus);
    return newCommentData;
  }

  addStatusPayload(comment: CommentViewModel, status?: string) {
    const newStatus = status ? status : LikeStatus.None;
    return {
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: newStatus,
      },
    };
  }

}
