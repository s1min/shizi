import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LibraryService } from '../library/library.service';
import { SyncProgressDto } from './dto/sync-progress.dto';
import { LearningService } from './learning.service';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(
    private readonly learningService: LearningService,
    private readonly libraryService: LibraryService,
  ) {}

  /** 获取完整学习进度 */
  @Get('progress')
  async getProgress(@Req() req: any) {
    const record = await this.learningService.getProgress(req.user.userId);
    if (!record)
      return null;
    return this.toClientData(record);
  }

  /** 全量覆盖学习进度 */
  @Put('progress')
  async putProgress(@Req() req: any, @Body() body: SyncProgressDto) {
    const record = await this.learningService.putProgress(
      req.user.userId,
      body,
    );
    return this.toClientData(record);
  }

  /** 增量同步（带时间戳冲突检测） */
  @Post('sync')
  async syncProgress(@Req() req: any, @Body() body: SyncProgressDto) {
    const record = await this.learningService.syncProgress(
      req.user.userId,
      body,
    );
    return this.toClientData(record);
  }

  /** 今日待复习汉字列表 */
  @Get('review-list')
  async getReviewList(@Req() req: any) {
    return this.learningService.getReviewList(req.user.userId);
  }

  /** 指定字库的单元总览 */
  @Get('unit-overview')
  async getUnitOverview(@Req() req: any, @Query('libraryId') libraryId?: string) {
    const targetLibraryId = libraryId || 'lib_1a_upper';
    return this.learningService.getUnitOverview(
      req.user.userId,
      targetLibraryId,
      this.libraryService,
    );
  }

  /** 转换为前端需要的格式（去掉 MongoDB 内部字段） */
  private toClientData(record: any) {
    return {
      charRecords: record.charRecords || {},
      unitProgressMap: record.unitProgressMap || {},
      wrongRecords: record.wrongRecords || [],
      learnDays: record.learnDays || [],
      currentLibraryId: record.currentLibraryId || 'lib_1a_upper',
      currentStageIndex: record.currentStageIndex || 0,
      currentUnitId: record.currentUnitId || 'unit_1',
      clientUpdatedAt: record.clientUpdatedAt || 0,
    };
  }
}
