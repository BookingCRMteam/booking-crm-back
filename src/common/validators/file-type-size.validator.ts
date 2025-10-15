import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsFileValid(
  mimeTypes: string[],
  maxSizeMb: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFileValid',
      target: object.constructor,
      propertyName,
      constraints: [mimeTypes, maxSizeMb],
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!value) return true;

          const file = value as Express.Multer.File;

          if (!file?.mimetype || !file?.size) return false;

          const isMimeValid = mimeTypes.includes(file.mimetype);
          const isSizeValid = file.size <= maxSizeMb * 1024 * 1024;

          return isMimeValid && isSizeValid;
        },
        defaultMessage(): string {
          return `File must be one of: ${mimeTypes.join(
            ', ',
          )} and smaller than ${maxSizeMb}MB`;
        },
      },
    });
  };
}
