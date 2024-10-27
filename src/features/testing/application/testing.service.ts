import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class TestingService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
  }

  async deleteAll() {
      await this.dataSource.query('TRUNCATE TABLE users')
      await this.dataSource.query('TRUNCATE TABLE devices')
      await this.dataSource.query('TRUNCATE TABLE tokens')
      await this.dataSource.query('TRUNCATE TABLE likes')
      await this.dataSource.query('TRUNCATE TABLE comments')
      await this.dataSource.query('TRUNCATE TABLE posts')
      await this.dataSource.query('TRUNCATE TABLE blogs')
  }

}
