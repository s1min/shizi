import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LearningRecord } from './learning.schema';
import { LibraryService } from '../library/library.service';

type UnitTaskStatus = 'not_started' | 'learning' | 'ready_for_test' | 'tested';

@Injectable()
export class LearningService {
  constructor(
    @InjectModel(LearningRecord.name)
    private recordModel: Model<LearningRecord>,
  ) {}

  /** 获取用户学习进度，不存在则返回 null */
  async getProgress(userId: string): Promise<LearningRecord | null> {
    return this.recordModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  /** 全量覆盖学习进度 */
  async putProgress(userId: string, data: Partial<LearningRecord>) {
    const filter = { userId: new Types.ObjectId(userId) };
    const update = {
      ...data,
      userId: new Types.ObjectId(userId),
    };
    return this.recordModel.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
    });
  }

  /** 增量同步：比较 clientUpdatedAt，取较新的 */
  async syncProgress(userId: string, clientData: Partial<LearningRecord>) {
    const existing = await this.getProgress(userId);

    // 无服务端记录，直接写入
    if (!existing) {
      return this.putProgress(userId, clientData);
    }

    const serverTime = existing.clientUpdatedAt || 0;
    const clientTime = clientData.clientUpdatedAt || 0;

    // 客户端数据更新，用客户端覆盖
    if (clientTime > serverTime) {
      return this.putProgress(userId, clientData);
    }

    // 服务端数据更新，返回服务端数据
    return existing;
  }

  /** 获取今日待复习的汉字 ID 列表 */
  async getReviewList(userId: string): Promise<string[]> {
    const record = await this.getProgress(userId);
    if (!record || !record.charRecords) return [];

    const now = Date.now();
    return Object.entries(record.charRecords)
      .filter(([, cr]: [string, any]) => cr.nextReviewAt && cr.nextReviewAt <= now)
      .map(([charId]) => charId);
  }

  private resolveUnitTaskStatus(progress?: any): UnitTaskStatus {
    const charIndex = progress?.charIndex || 0;
    const learnCompleted = progress?.learnCompleted ?? progress?.completed ?? false;
    const testCompleted = progress?.testCompleted
      ?? ((progress?.completed ?? false) && (progress?.stars || 0) > 0);

    if (testCompleted) {
      return 'tested';
    }
    if (learnCompleted) {
      return 'ready_for_test';
    }
    if (charIndex > 0) {
      return 'learning';
    }
    return 'not_started';
  }

  async getUnitOverview(
    userId: string,
    libraryId: string,
    libraryService: Pick<LibraryService, 'findById'>,
  ) {
    const [record, library] = await Promise.all([
      this.getProgress(userId),
      libraryService.findById(libraryId),
    ]);

    if (!library) {
      return null;
    }

    const unitProgressMap = record?.unitProgressMap || {};

    return {
      libraryId: library._id,
      libraryName: library.name,
      stages: (library.stages || []).map((stage: any) => ({
        id: stage.id,
        name: stage.name,
        units: (stage.units || []).map((unit: any) => {
          const raw = unitProgressMap[unit.id] || {};
          const charIndex = raw.charIndex || 0;
          const learnCompleted = raw.learnCompleted ?? raw.completed ?? false;
          const testCompleted = raw.testCompleted
            ?? ((raw.completed ?? false) && (raw.stars || 0) > 0);
          const stars = raw.stars || 0;
          const totalChars = Array.isArray(unit.chars) ? unit.chars.length : 0;

          return {
            id: unit.id,
            name: unit.name,
            lesson: unit.lesson,
            chars: unit.chars || [],
            totalChars,
            charIndex,
            learnCompleted,
            testCompleted,
            stars,
            status: this.resolveUnitTaskStatus(raw),
          };
        }),
      })),
    };
  }
}
