import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitTestDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assetIds?: string[];
}
