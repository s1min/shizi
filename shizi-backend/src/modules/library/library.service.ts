import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Library } from './library.schema';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name) private libraryModel: Model<Library>,
  ) {}

  /** 获取字库列表（不含 stages 详情） */
  async findAll(): Promise<Library[]> {
    return this.libraryModel.find(
      {},
      { _id: 1, name: 1, type: 1, description: 1, target_age: 1, total_chars: 1 },
    );
  }

  /** 获取字库详情（含完整 stages/units/chars） */
  async findById(id: string): Promise<Library | null> {
    return this.libraryModel.findById(id);
  }
}
