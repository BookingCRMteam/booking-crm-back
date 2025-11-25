import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { GetToursQueryDto } from './get-tours-query.dto';

export enum TourStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export class AdminGetToursQueryDto extends GetToursQueryDto {
  @IsOptional()
  @IsEnum(TourStatus)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (Object.values(TourStatus).includes(lower as TourStatus)) {
        return lower as TourStatus;
      }
    }
    return undefined; // повертаємо undefined якщо value некоректне
  })
  status?: TourStatus;

  @IsOptional()
  @IsString()
  search?: string;
  // limit/offset inherited from GetToursQueryDto
}
