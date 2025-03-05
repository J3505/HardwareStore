import { IsString, IsNotEmpty } from 'class-validator';
import { RoleEnum } from '../../common/enums/role.enum';
import { IsRoleEnum } from '../../common/decorators/is-role-enum.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsRoleEnum()
  role: RoleEnum;
}