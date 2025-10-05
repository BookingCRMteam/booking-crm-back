import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { GetToursQueryDto } from './get-tours-query.dto';

@ValidatorConstraint({ name: 'dateRange', async: false })
export class DateRangeValidator implements ValidatorConstraintInterface {
  private validationError: string | null = null;
  validate(propertyValue: string, args: ValidationArguments) {
    const object = args.object as GetToursQueryDto;
    const { minStartDate, maxStartDate, minEndDate, maxEndDate } = object;

    if (minStartDate && maxStartDate) {
      if (new Date(minStartDate) >= new Date(maxStartDate)) {
        this.validationError = 'minStartDate should be less than maxStartDate';
        return false;
      }
    }

    if (minStartDate) {
      if (new Date(minStartDate) <= new Date()) {
        this.validationError = 'minStartDate should be more than today';
        return false;
      }
    }

    if (minEndDate && minStartDate) {
      if (new Date(minEndDate) <= new Date(minStartDate)) {
        this.validationError = 'minEndDate should be more than minStartDate';
        return false;
      }
    }

    if (minEndDate && maxEndDate) {
      if (new Date(minEndDate) >= new Date(maxEndDate)) {
        this.validationError = 'minEndDate should be less than maxEndDate';
        return false;
      }
    }
    this.validationError = null;
    return true;
  }

  defaultMessage() {
    return this.validationError || 'Date range validation failed';
  }
}
