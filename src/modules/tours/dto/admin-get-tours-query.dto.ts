import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
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
    return undefined;
  })
  status?: TourStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString({}, { message: 'minDate must be a valid ISO date string' })
  declare minDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'maxEndDate must be a valid ISO date string' })
  declare maxEndDate?: string;
}
