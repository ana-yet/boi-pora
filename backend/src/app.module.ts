import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { AdminModule } from './modules/admin/admin.module';
import { LibraryModule } from './modules/library/library.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReadingModule } from './modules/reading/reading.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/boi-pora'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    BooksModule,
    ChaptersModule,
    AdminModule,
    LibraryModule,
    ReviewsModule,
    ReadingModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
