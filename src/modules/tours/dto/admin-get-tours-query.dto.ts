import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { GetToursQueryDto } from './get-tours-query.dto';
import { IsValidDate } from '@app/common/validators/is-valid-date.validator';

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
  @IsValidDate({
    message: 'minDate must be a valid calendar date (YYYY-MM-DD)',
  })
  declare minDate?: string;

  @IsOptional()
  @IsValidDate({
    message: 'maxEndDate must be a valid calendar date (YYYY-MM-DD)',
  })
  declare maxEndDate?: string;
}
