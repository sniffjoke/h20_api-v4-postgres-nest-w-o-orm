export enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

// class LikeDetails {
//     addedAt: string
//     userId: string
//     login: string
// }

// class ExtendedLikesInfo {
//     likesCount: number;
//     dislikesCount: number;
//     newestLikes: LikeDetails[];
// }

export class PostViewModel {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    // extendedLikesInfo: ExtendedLikesInfo
    createdAt: string;
}
