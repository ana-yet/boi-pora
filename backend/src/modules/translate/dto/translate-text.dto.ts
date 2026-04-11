import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

/** ISO-style codes compatible with Langbly / Google Translate v2 style APIs. */
const SOURCE = [
  'auto',
  'en',
  'bn',
  'es',
  'fr',
  'de',
  'hi',
  'ar',
  'pt',
  'ru',
  'ja',
  'ko',
  'zh',
  'it',
  'tr',
  'vi',
  'id',
  'th',
  'pl',
  'nl',
  'sv',
  'el',
  'he',
  'fa',
  'ur',
] as const;
const TARGET = SOURCE.filter((c) => c !== 'auto');

export class TranslateTextDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120_000)
  text!: string;

  @IsString()
  @IsIn(SOURCE as unknown as string[])
  source!: string;

  @IsString()
  @IsIn(TARGET as unknown as string[])
  target!: string;
}
