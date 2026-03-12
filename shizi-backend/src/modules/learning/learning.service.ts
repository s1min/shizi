import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LearningRecord } from './learning.schema';

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
}
