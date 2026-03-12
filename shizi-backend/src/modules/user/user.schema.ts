import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class ChildInfo {
  @Prop({ default: '' }) name: string;
  @Prop({ default: '' }) age_group: string;
  @Prop({ default: 'lib_1a_upper' }) current_library: string;
  @Prop({ default: 5 }) daily_new_chars: number;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  openid: string;

  @Prop({ default: '' })
  nickname: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ type: Object, default: null })
  child: ChildInfo | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
