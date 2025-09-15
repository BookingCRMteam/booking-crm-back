import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsBooleanLikeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    let v: boolean | string;
    if (typeof value === 'string') {
      v = value.trim().toLowerCase();
    } else if (typeof value === 'boolean') {
      v = value;
    } else {
      return false;
    }
    return v === true || v === false || v === 'true' || v === 'false';
  }
  defaultMessage(args?: ValidationArguments) {
    const prop = args?.property ?? 'value';
    return `${prop} must be a boolean (true/false).`;
  }
}

export function IsBooleanLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBooleanLikeConstraint,
    });
  };
}
