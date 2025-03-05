import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { RoleEnum } from '../enums/role.enum';

export function IsRoleEnum(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRoleEnum',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return Object.values(RoleEnum).includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be one of the following values: ${Object.values(RoleEnum).join(', ')}`;
        },
      },
    });
  };
}
