import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AttachAssetsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  assetIds!: string[];
}
