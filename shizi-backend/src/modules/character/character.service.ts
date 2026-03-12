import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character } from './character.schema';

@Injectable()
export class CharacterService {
  constructor(
    @InjectModel(Character.name) private characterModel: Model<Character>,
  ) {}

  /** 批量获取汉字数据 */
  async findByIds(ids: string[]): Promise<Character[]> {
    return this.characterModel.find({ _id: { $in: ids } });
  }
}
