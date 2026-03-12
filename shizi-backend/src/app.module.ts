import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LearningModule } from './modules/learning/learning.module';
import { CharacterModule } from './modules/character/character.module';
import { LibraryModule } from './modules/library/library.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UserModule,
    LearningModule,
    CharacterModule,
    LibraryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
