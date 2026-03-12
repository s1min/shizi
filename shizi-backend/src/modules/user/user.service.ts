import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /** 根据 openid 查找或创建用户 */
  async findOrCreateByOpenid(openid: string): Promise<User> {
    let user = await this.userModel.findOne({ openid });
    if (!user) {
      user = await this.userModel.create({ openid });
    }
    return user;
  }

  /** 根据 id 查找用户 */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  /** 更新用户信息（昵称、头像） */
  async updateProfile(
    id: string,
    data: { nickname?: string; avatar?: string },
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  /** 更新宝宝信息 */
  async updateChild(
    id: string,
    data: { name?: string; age_group?: string; current_library?: string; daily_new_chars?: number },
  ): Promise<User | null> {
    // 合并更新 child 子文档
    const updateFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateFields[`child.${key}`] = value;
      }
    }
    return this.userModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
  }
}
