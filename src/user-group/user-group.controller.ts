import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import {
  UpdateUserGroupDto,
  AddMemberDto,
  RemoveMemberDto,
} from './dto/update-user-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-groups')
@UseGuards(JwtAuthGuard)
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  @Post()
  createGroup(@Body() createUserGroupDto: CreateUserGroupDto, @Req() req: any) {
    return this.userGroupService.create(createUserGroupDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.userGroupService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.userGroupService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
    @Req() req: any,
  ) {
    return this.userGroupService.update(
      id,
      updateUserGroupDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.userGroupService.remove(id, req.user.userId);
  }

  @Post(':id/members')
  addMembers(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req: any,
  ) {
    return this.userGroupService.addMembers(id, addMemberDto, req.user.userId);
  }

  @Delete(':id/members')
  removeMembers(
    @Param('id') id: string,
    @Body() removeMemberDto: RemoveMemberDto,
    @Req() req: any,
  ) {
    return this.userGroupService.removeMembers(
      id,
      removeMemberDto,
      req.user.userId,
    );
  }
}
