/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional } from 'class-validator';
import { RoleEnum } from '../../common/enums/role.enum';
import { IsRoleEnum } from '../../common/decorators/is-role-enum.decorator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsRoleEnum()
  role?: RoleEnum;
}
