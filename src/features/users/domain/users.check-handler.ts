import { ForbiddenException } from '@nestjs/common';


export class UsersCheckHandler {
  checkIsOwner(featureOwnerId: string, userId: string) {
    if (featureOwnerId !== userId) {
      throw new ForbiddenException('User is not owner');
    } else {
      return true;
    }
  }
}
