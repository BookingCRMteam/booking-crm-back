import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { GetToursQueryDto } from './get-tours-query.dto';

@ValidatorConstraint({ name: 'dateRange', async: false })
export class DateRangeValidator implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    const object = args.object as GetToursQueryDto;
    const { minStartDate, maxStartDate, minEndDate, maxEndDate } = object;

    if (minStartDate && maxStartDate) {
      if (new Date(minStartDate) >= new Date(maxStartDate)) {
        return false;
      }
    }

    if (minStartDate) {
      if (new Date(minStartDate) <= new Date()) {
        return false;
      }
    }

    if (minEndDate && minStartDate) {
      if (new Date(minEndDate) <= new Date(minStartDate)) {
        return false;
      }
    }

    if (minEndDate && maxEndDate) {
      if (new Date(minEndDate) >= new Date(maxEndDate)) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as GetToursQueryDto;
    const { minStartDate, maxStartDate, minEndDate, maxEndDate } = object;

    if (minStartDate && maxStartDate) {
      if (new Date(minStartDate) >= new Date(maxStartDate)) {
        return 'minStartDate should be less than maxStartDate';
      }
    }

    if (minStartDate) {
      if (new Date(minStartDate) <= new Date()) {
        return 'minStartDate should be more than today';
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

    return 'Date range validation failed';
  }
}
