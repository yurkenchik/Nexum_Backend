import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/application/dto/user/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}