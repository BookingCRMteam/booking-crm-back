import { IsBooleanLike } from '@app/common/validators/boolean-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTourPhotoDto {
  @ApiProperty({
    example: 'true',
    description: 'Is this the main photo for the tour?',
    required: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean | undefined;
  })
  @IsBooleanLike()
  @IsOptional()
  isMain?: boolean;

  @ApiProperty({
    example: 'A beautiful view of the mountains.',
    description: 'A description of the photo.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
