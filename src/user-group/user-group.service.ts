import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserGroup } from './entities/user-group.entity';
import { User } from '../user/entities/user.entity';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import {
  UpdateUserGroupDto,
  AddMemberDto,
  RemoveMemberDto,
} from './dto/update-user-group.dto';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createUserGroupDto: CreateUserGroupDto,
    ownerId: string,
  ): Promise<UserGroup> {
    const userGroup = this.userGroupRepository.create({
      ...createUserGroupDto,
      ownerId,
    });

    const savedGroup = await this.userGroupRepository.save(userGroup);

    if (
      createUserGroupDto.memberIds &&
      createUserGroupDto.memberIds.length > 0
    ) {
      await this.addMembers(
        savedGroup.id,
        { userIds: createUserGroupDto.memberIds },
        ownerId,
      );
    }

    return this.findOne(savedGroup.id, ownerId);
  }

  async findAll(userId: string): Promise<UserGroup[]> {
    return this.userGroupRepository.find({
      where: [{ ownerId: userId }, { members: { id: userId } }],
      relations: ['owner', 'members'],
    });
  }

  async findOne(id: string, userId: string): Promise<UserGroup> {
    const userGroup = await this.userGroupRepository.findOne({
      where: { id },
      relations: ['owner', 'members'],
    });

    if (!userGroup) {
      throw new NotFoundException('User group not found');
    }

    const isMember = userGroup.members.some((member) => member.id === userId);
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

    await this.userGroupRepository.update(id, updateUserGroupDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const userGroup = await this.findOne(id, userId);

    if (userGroup.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the group');
    }

    await this.userGroupRepository.delete(id);
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

    const users = await this.userRepository.findByIds(addMemberDto.userIds);
    userGroup.members = [...userGroup.members, ...users];

    await this.userGroupRepository.save(userGroup);
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

    userGroup.members = userGroup.members.filter(
      (member) => !removeMemberDto.userIds.includes(member.id),
    );

    await this.userGroupRepository.save(userGroup);
    return this.findOne(id, userId);
  }
}
