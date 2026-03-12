import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

class Unit {
  @Prop() id: string;
  @Prop() name: string;
  @Prop() lesson: string;
  @Prop({ type: [String] }) chars: string[];
}

class Stage {
  @Prop() id: string;
  @Prop() name: string;
  @Prop({ type: [Object] }) units: Unit[];
}

export type LibraryDocument = HydratedDocument<Library>;

@Schema({ collection: 'libraries' })
export class Library {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  type: string; // 'textbook_sync' | 'curated'

  @Prop()
  description: string;

  @Prop()
  target_age: string;

  @Prop()
  total_chars: number;

  @Prop({ type: [Object] })
  stages: Stage[];
}

export const LibrarySchema = SchemaFactory.createForClass(Library);
