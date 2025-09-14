import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsBooleanStringConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return (
      value === true || value === false || value === 'true' || value === 'false'
    );
  }

  defaultMessage() {
    return 'isMain must be a boolean value (true or false)';
  }
}

export function IsBooleanString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBooleanStringConstraint,
    });
  };
}
