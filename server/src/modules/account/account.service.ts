import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateSubAccountDto, UpdateSubAccountDto } from './dto/create-account.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createSubAccount(parentId: number, dto: CreateSubAccountDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      password: hashedPassword,
      realName: dto.realName || '',
      role: dto.role || 'user',
      parentId,
      permissions: dto.permissions || [],
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return this.userRepository.save(user);
  }

  async findSubAccounts(parentId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { parentId },
      order: { createTime: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateSubAccount(id: number, dto: UpdateSubAccountDto): Promise<User | null> {
    const updateData: Partial<User> = {};

    if (dto.realName !== undefined) updateData.realName = dto.realName;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.permissions !== undefined) updateData.permissions = dto.permissions;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepository.update(id, updateData);
    return this.userRepository.findOne({ where: { id } });
  }

  async removeSubAccount(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.userRepository.delete({ id: In(ids) });
  }

  async getPermissionList(): Promise<{ key: string; label: string }[]> {
    return [
      { key: 'douyin', label: '抖音数据管理' },
      { key: 'kuaishou', label: '快手数据管理' },
      { key: 'videoAccount', label: '视频号数据管理' },
      { key: 'live', label: '直播数据管理' },
      { key: 'media', label: '自媒体数据管理' },
      { key: 'staff', label: '人员管理' },
      { key: 'expense', label: '费用管理' },
      { key: 'dataease', label: '数据源管理' },
      { key: 'dashboard', label: '数据大屏查看' },
    ];
  }
}
