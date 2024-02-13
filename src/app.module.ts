import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

require('dotenv').config();

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({

        type: 'postgres',
        // host: configService.get<string>('POSTGRES_HOST'),
        // port: configService.get<number>('POSTGRES_PORT'),
        // database: configService.get<string>('POSTGRES_DB'),
        host: "10.3.141.204",
        port: 5432,
        database: "mpesa_vybe",
        username: process.env.POSTGRES_VYBE_USER,
        password: process.env.POSTGRES_VYBE_PASSWORD,
        entities: [User],
        synchronize: true,
      }),
    }),
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
