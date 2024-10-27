import { config } from 'dotenv';
import * as process from 'node:process';
config({ path: '.development.env' });

export const SETTINGS = {
  PORT: process.env.PORT || 5000,
  PORT_DB: process.env.DB_PORT || 5432,
  PATH: {
    HOST: process.env.DB_HOST,
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DATABASE_NAME,
    API_URL: process.env.API_URL

  },
  VARIABLES: {
    ADMIN: process.env.ADMIN || 'admin:qwerty',
    JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS,
    JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH,
  }
}
