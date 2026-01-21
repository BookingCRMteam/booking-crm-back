import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidDate(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      name: 'IsValidDate',
      target: object.constructor,
      propertyName: String(propertyName),
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (typeof value !== 'string') return false;

          // YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          const [y, m, d] = value.split('-').map(Number);
          const date = new Date(value);
          return (
            !isNaN(date.getTime()) &&
            date.getUTCFullYear() === y &&
            date.getUTCMonth() + 1 === m &&
            date.getUTCDate() === d
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid calendar date (YYYY-MM-DD)`;
        },
      },
    });
  };
}
