import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

class ExampleSentence {
  @Prop() text: string;
  @Prop() highlight_index: number;
}

class Teaching {
  @Prop() animation_type: string; // 'origin' | 'decompose' | 'scene'
  @Prop() origin_desc: string;
  @Prop({ type: [String] }) decompose_parts: string[];
  @Prop() decompose_desc: string;
  @Prop() scene_desc: string;
  @Prop() emoji_fallback: string;
  @Prop() image_asset: string;
}

export type CharacterDocument = HydratedDocument<Character>;

@Schema({ collection: 'characters' })
export class Character {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  pinyin: string;

  @Prop({ required: true })
  char_type: string; // '象形' | '会意' | '形声' | '指事' | '抽象'

  @Prop()
  radical: string;

  @Prop()
  strokes: number;

  @Prop()
  stroke_order: string;

  @Prop({ type: [String] })
  stroke_paths: string[];

  @Prop({ type: Object })
  stroke_medians: number[][][];

  @Prop({ type: [String] })
  similar_chars: string[];

  @Prop({ type: [String] })
  example_words: string[];

  @Prop({ type: [Object] })
  example_sentences: ExampleSentence[];

  @Prop({ type: Object })
  teaching: Teaching;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
