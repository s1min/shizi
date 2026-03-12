import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningRecord, LearningRecordSchema } from './learning.schema';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningRecord.name, schema: LearningRecordSchema },
    ]),
  ],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
