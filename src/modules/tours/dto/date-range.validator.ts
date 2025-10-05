import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { GetToursQueryDto } from './get-tours-query.dto';

@ValidatorConstraint({ name: 'dateRange', async: false })
export class DateRangeValidator implements ValidatorConstraintInterface {
  private getValidationError(args: ValidationArguments): string | null {
    const object = args.object as GetToursQueryDto;
    const { minStartDate, maxStartDate, minEndDate, maxEndDate } = object;

    if (minStartDate && maxStartDate) {
      if (new Date(minStartDate) >= new Date(maxStartDate)) {
        return 'minStartDate should be less than maxStartDate';
      }
    }

    if (minStartDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (new Date(minStartDate) < today) {
        return 'minStartDate must be after today';
      }
    }

    if (minEndDate && minStartDate) {
      if (new Date(minEndDate) <= new Date(minStartDate)) {
        return 'minEndDate should be more than minStartDate';
      }
    }

    if (minEndDate && maxEndDate) {
      if (new Date(minEndDate) >= new Date(maxEndDate)) {
        return 'minEndDate should be less than maxEndDate';
      }
    }

    if (maxStartDate) {
      if (new Date(maxStartDate) <= new Date()) {
        return 'maxStartDate should be more than today';
      }
    }

    if (maxEndDate && minStartDate) {
      if (new Date(maxEndDate) <= new Date(minStartDate)) {
        return 'maxEndDate should be more than minStartDate';
      }
    }

    if (maxStartDate && minEndDate) {
      if (new Date(maxStartDate) >= new Date(minEndDate)) {
        return 'maxStartDate should be less than minEndDate';
      }
    }

    return null;
  }

  validate(propertyValue: string, args: ValidationArguments) {
    return this.getValidationError(args) === null;
  }

  defaultMessage(args: ValidationArguments) {
    return this.getValidationError(args) || 'Date range validation failed';
  }
}
