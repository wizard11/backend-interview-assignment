import { PartialType } from '@nestjs/mapped-types';
import { CreateUserGroupDto } from './create-user-group.dto';

export class UpdateUserGroupDto extends PartialType(CreateUserGroupDto) {}

export class AddMemberDto {
  userIds: string[];
}

export class RemoveMemberDto {
  userIds: string[];
}
