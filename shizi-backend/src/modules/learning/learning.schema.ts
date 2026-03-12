import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/** 单字学习记录 */
class CharRecord {
  @Prop() charId: string;
  @Prop() learnedAt: number;
  @Prop() quizCorrect: boolean;
  @Prop() reviewCount: number;
  @Prop() nextReviewAt: number;
}

/** 错题记录 */
class WrongRecord {
  @Prop() charId: string;
  @Prop() quizType: string;
  @Prop() unitId: string;
  @Prop() wrongAt: number;
  @Prop() retried: boolean;
}

/** 单元进度 */
class UnitProgress {
  @Prop() unitId: string;
  @Prop() charIndex: number;
  @Prop() completed: boolean;
  @Prop() stars: number;
}

@Schema({ timestamps: true })
export class LearningRecord extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  /** 已学汉字记录 { charId: CharRecord } */
  @Prop({ type: Object, default: {} })
  charRecords: Record<string, CharRecord>;

  /** 单元进度 { unitId: UnitProgress } */
  @Prop({ type: Object, default: {} })
  unitProgressMap: Record<string, UnitProgress>;

  /** 错题记录 */
  @Prop({ type: [Object], default: [] })
  wrongRecords: WrongRecord[];

  /** 学习天数 */
  @Prop({ type: [String], default: [] })
  learnDays: string[];

  /** 当前字库 */
  @Prop({ default: 'lib_1a_upper' })
  currentLibraryId: string;

  /** 当前阶段索引 */
  @Prop({ default: 0 })
  currentStageIndex: number;

  /** 当前单元 ID */
  @Prop({ default: 'unit_1' })
  currentUnitId: string;

  /** 客户端最后更新时间戳 */
  @Prop({ default: 0 })
  clientUpdatedAt: number;
}

export const LearningRecordSchema =
  SchemaFactory.createForClass(LearningRecord);
