import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../posts/api/models/output/post.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class LikeHandler {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async postHandler(likeStatus: string, post: any, user: any) {
    const isLikeObjectForCurrentUserExists: any | null = await this.dataSource.query(
      `
              SELECT * 
              FROM likes
              WHERE "userId" = $1 AND "postId" = $2
      `,
      [
        user.id,
        post.id,
      ],
    );
    if (!isLikeObjectForCurrentUserExists.length) {
      const newLike = await this.dataSource.query(
        `
                INSERT INTO likes ("status", "userId", "postId") 
                VALUES ($1, $2, $3)
        `,
        [
          LikeStatus.None,
          user.id,
          post.id,
        ],
      );
    }
    const findedLike: any | null = await this.dataSource.query(
      `
              SELECT * 
              FROM likes
              WHERE "userId" = $1 AND "postId" = $2
      `,
      [
        user.id,
        post.id,
      ],
    ); // Пессимистическая блокировка
    if (findedLike[0].status === likeStatus) {
      const updateLikeStatus = null;
    } else {
      const updateLikeStatus = await this.dataSource.query(
        `
                UPDATE likes 
                SET status = $1 
                WHERE "id" = $2
        `,
        [
          likeStatus,
          findedLike[0].id,
        ],
      );
      const dislikeCount = post.extendedLikesInfoDislikesCount;
      const likeCount = post.extendedLikesInfoLikesCount;
      if (likeStatus === LikeStatus.Like) {
        if (dislikeCount > 0 && findedLike[0]?.status === LikeStatus.Dislike) {
          const updatePostInfo = await this.dataSource.query(
            `
                    UPDATE posts 
                    SET "extendedLikesInfoLikesCount" = "extendedLikesInfoLikesCount" + 1, "extendedLikesInfoDislikesCount" = "extendedLikesInfoDislikesCount" - 1
                    WHERE "id" = $1
            `,
            [post.id],
          );
        } else {
          const updatePostInfo = await this.dataSource.query(
            `
                    UPDATE posts 
                    SET "extendedLikesInfoLikesCount" = "extendedLikesInfoLikesCount" + 1
                    WHERE "id" = $1
            `,
            [post.id]
          );
        }
      }

      if (likeStatus === LikeStatus.Dislike) {
        if (likeCount > 0 && findedLike[0]?.status === LikeStatus.Like) {
          const updatePostInfo = await this.dataSource.query(
            `
                    UPDATE posts 
                    SET "extendedLikesInfoLikesCount" = "extendedLikesInfoLikesCount" - 1, "extendedLikesInfoDislikesCount" = "extendedLikesInfoDislikesCount" + 1
                    WHERE "id" = $1
            `,
            [post.id],
          );
        } else {
          const updatePostInfo = await this.dataSource.query(
            `
                    UPDATE posts 
                    SET "extendedLikesInfoDislikesCount" = "extendedLikesInfoDislikesCount" + 1
                    WHERE "id" = $1
            `,
            [post.id]
          );
        }
      }

      if (likeStatus === LikeStatus.None) {
        if (findedLike[0]?.status === LikeStatus.Like) {
          const updatePostInfo = await this.dataSource.query(
            `
                    UPDATE posts 
                    SET "extendedLikesInfoLikesCount" = "extendedLikesInfoLikesCount" - 1
                    WHERE "id" = $1
            `,
            [post.id]
          );
        } else {
          const updatePostInfo = await this.dataSource.query(
            `
                    UPDATE posts 
                    SET "extendedLikesInfoDislikesCount" = "extendedLikesInfoDislikesCount" - 1
                    WHERE "id" = $1
            `,
            [post.id]
          );
        }
      }
    }
  }

  async commentHandler(likeStatus: string, comment: any, user: any) {
    const isLikeObjectForCurrentUserExists: any | null = await this.dataSource.query(
      `
              SELECT * 
              FROM likes
              WHERE "userId" = $1 AND "commentId" = $2
      `,
      [
        user.id,
        comment.id,
      ],
    );
    if (!isLikeObjectForCurrentUserExists.length) {
      const newLike = await this.dataSource.query(
        `
                INSERT INTO likes ("status", "userId", "commentId") 
                VALUES ($1, $2, $3)
        `,
        [
          LikeStatus.None,
          user.id,
          comment.id,
        ],
      );
    }
    const findedLike: any | null = await this.dataSource.query(
      `
              SELECT * 
              FROM likes
              WHERE "userId" = $1 AND "commentId" = $2
      `,
      [
        user.id,
        comment.id,
      ],
    );
    if (findedLike[0]?.status === likeStatus) {
      const updateLikeStatus = null;
    } else {
      const updateLikeStatus = await this.dataSource.query(
        `
                UPDATE likes 
                SET status = $1 
                WHERE "id" = $2
        `,
        [
          likeStatus,
          findedLike[0].id,
        ],
      );
      const dislikeCount = comment.likesInfoDislikesCount;
      const likeCount = comment.likesInfoLikesCount;
      if (likeStatus === LikeStatus.Like) {
        if (dislikeCount > 0 && findedLike[0]?.status === LikeStatus.Dislike) {
          const updateCommentInfo = await this.dataSource.query(
            `
                    UPDATE comments 
                    SET "likesInfoLikesCount" = "likesInfoLikesCount" + 1, "likesInfoDislikesCount" = "likesInfoDislikesCount" - 1
                    WHERE "id" = $1
            `,
            [comment.id],
          );
        } else {
          const updateCommentInfo = await this.dataSource.query(
            `
                    UPDATE comments 
                    SET "likesInfoLikesCount" = "likesInfoLikesCount" + 1
                    WHERE "id" = $1
            `,
            [comment.id]
          );
        }
      }
      if (likeStatus === LikeStatus.Dislike) {
        if (likeCount > 0 && findedLike[0]?.status === LikeStatus.Like) {
          const updateCommentInfo = await this.dataSource.query(
            `
                    UPDATE comments 
                    SET "likesInfoLikesCount" = "likesInfoLikesCount" - 1, "likesInfoDislikesCount" = "likesInfoDislikesCount" + 1
                    WHERE "id" = $1
            `,
            [comment.id],
          );
        } else {
          const updateCommentInfo = await this.dataSource.query(
            `
                    UPDATE comments 
                    SET "likesInfoDislikesCount" = "likesInfoDislikesCount" + 1
                    WHERE "id" = $1
            `,
            [comment.id]
          );
        }
      }
      if (likeStatus === LikeStatus.None) {
        if (findedLike[0]?.status === LikeStatus.Like) {
          const updateCommentInfo = await this.dataSource.query(
            `
                    UPDATE comments 
                    SET "likesInfoLikesCount" = "likesInfoLikesCount" - 1
                    WHERE "id" = $1
            `,
            [comment.id]
          );
        } else {
          const updateCommentInfo = await this.dataSource.query(
            `
                    UPDATE comments 
                    SET "likesInfoDislikesCount" = "likesInfoDislikesCount" - 1
                    WHERE "id" = $1
            `,
            [comment.id]
          );
        }
      }
    }
  }

}
