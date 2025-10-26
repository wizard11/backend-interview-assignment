import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UserGroup } from '@prisma/client';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import {
  UpdateUserGroupDto,
  AddMemberDto,
  RemoveMemberDto,
} from './dto/update-user-group.dto';

@Injectable()
export class UserGroupService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserGroupDto: CreateUserGroupDto,
    ownerId: string,
  ): Promise<UserGroup> {
    const { memberIds, ...groupData } = createUserGroupDto;

    const savedGroup = await this.prisma.userGroup.create({
      data: {
        id: randomUUID(),
        name: groupData.name,
        description: groupData.description,
        ownerId,
      },
    });

    if (memberIds && memberIds.length > 0) {
      await this.addMembers(savedGroup.id, { userIds: memberIds }, ownerId);
    }

    return this.findOne(savedGroup.id, ownerId);
  }

  async findAll(userId: string): Promise<UserGroup[]> {
    return this.prisma.userGroup.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
      },
    });
  }

  async findOne(id: string, userId: string): Promise<UserGroup> {
    const userGroup = await this.prisma.userGroup.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!userGroup) {
      throw new NotFoundException('User group not found');
    }

    const isMember = userGroup.members.some(
      (member) => member.userId === userId,
    );
    if (userGroup.ownerId !== userId && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    return userGroup;
  }

  async update(
    id: string,
    updateUserGroupDto: UpdateUserGroupDto,
    userId: string,
  ): Promise<UserGroup> {
    const userGroup = await this.findOne(id, userId);

    if (userGroup.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update the group');
    }

    await this.prisma.userGroup.update({
      where: { id },
      data: updateUserGroupDto,
    });
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const userGroup = await this.findOne(id, userId);

    if (userGroup.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the group');
    }

    await this.prisma.userGroup.delete({ where: { id } });
  }

  async addMembers(
    id: string,
    addMemberDto: AddMemberDto,
    userId: string,
  ): Promise<UserGroup> {
    const userGroup = await this.findOne(id, userId);

    if (userGroup.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can add members');
    }

    // Create user group member records
    const memberData = addMemberDto.userIds.map((userId) => ({
      id: randomUUID(),
      userId,
      groupId: id,
    }));

    await this.prisma.userGroupMember.createMany({
      data: memberData,
      skipDuplicates: true, // Skip if user is already a member
    });

    return this.findOne(id, userId);
  }

  async removeMembers(
    id: string,
    removeMemberDto: RemoveMemberDto,
    userId: string,
  ): Promise<UserGroup> {
    const userGroup = await this.findOne(id, userId);

    if (userGroup.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can remove members');
    }

    await this.prisma.userGroupMember.deleteMany({
      where: {
        groupId: id,
        userId: { in: removeMemberDto.userIds },
      },
    });

    return this.findOne(id, userId);
  }
}
