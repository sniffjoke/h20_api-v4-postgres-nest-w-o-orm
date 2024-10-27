import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { EmailConfirmationModel } from '../api/models/input/create-user.dto';


@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async createUser(userData: any) {
    const result = await this.dataSource.query(
      'INSERT INTO users ("login", "email", "password", "emailConfirmationIsConfirm", "emailConfirmationConfirmationCode", "emailConfirmationExpirationDate") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "id", "login", "email", "createdAt"', [
        userData.login,
        userData.email,
        userData.password,
        userData.emailConfirmationIsConfirmed,
        userData.emailConfirmationConfirmationCode,
        userData.emailConfirmationExpirationDate,
      ],
    );
    return result[0];
  }


  async updateUserByActivateEmail(userId: any) {
    const updateUserInfo = await this.dataSource.query(
      `
                UPDATE users 
                SET "emailConfirmationIsConfirm" = true
                WHERE id = $1
            `,
      [userId]);
    return updateUserInfo;
  }

  async updateUserByResendEmail(userId: any, emailConfirmation: EmailConfirmationModel) {
    const updateUserInfo = await this.dataSource.query(
      `
                UPDATE users 
                SET "emailConfirmationExpirationDate" = $2, "emailConfirmationConfirmationCode" = $3
                WHERE id = $1
            `,
      [
        userId,
        emailConfirmation.emailConfirmationExpirationDate,
        emailConfirmation.emailConfirmationConfirmationCode,
      ]);
    return updateUserInfo;
  }

  async findUserById(id: string) {
    const findedUser = await this.dataSource.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!findedUser.length) {
      throw new NotFoundException('User not found');
    }
    return findedUser[0];
  }

  async findUserByIdOrNull(id: string) {
    const findedUser = await this.dataSource.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!findedUser.length) {
      return null
    } else return findedUser[0];
  }

  async findUserByLogin(login: string) {
    const findedUser = await this.dataSource.query('SELECT * FROM users WHERE login = $1', [login]);
    if (!findedUser.length) {
      throw new UnauthorizedException('User not found');
    }
    return findedUser[0];
  }

  async findUserByEmail(email: string) {
    const findedUser = await this.dataSource.query(
      `
                SELECT * FROM users WHERE email = $1
            `,
      [email],
    );
    if (!findedUser.length) {
      throw new BadRequestException('Email not exists');
    }
    return findedUser[0];
  }

  async findUserByCode(code: string) {
    const findedUser = await this.dataSource.query('SELECT * FROM users WHERE "emailConfirmationConfirmationCode" = $1', [code]);
    if (!findedUser.length) {
      throw new BadRequestException('Code not found');
    }
    return findedUser[0];
  }

  async deleteUserById(id: string) {
    const findedUser = await this.findUserById(id);
    return await this.dataSource.query('DELETE FROM users WHERE "id" = $1', [id]);
  }

  async checkIsUserExists(login: string, email: string) {
    const findedUserByLogin = await this.dataSource.query(
      'SELECT * FROM users WHERE "login" = $1',
      [login],
    );
    if (findedUserByLogin.length) {
      throw new BadRequestException(
        'Login already exists',
      );
    }
    const findedUserByEmail = await this.dataSource.query(
      'SELECT * FROM users WHERE "email" = $1',
      [email],
    );
    if (findedUserByEmail.length) {
      throw new BadRequestException('Email already exists');
    }
  }

}
