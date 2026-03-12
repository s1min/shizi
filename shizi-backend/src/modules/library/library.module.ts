import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Library, LibrarySchema } from './library.schema';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
    ]),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
