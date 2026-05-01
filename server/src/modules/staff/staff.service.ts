import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const record = this.staffRepository.create(dto);
    return this.staffRepository.save(record);
  }

  async findAll(role?: string): Promise<Staff[]> {
    if (role) {
      return this.staffRepository.find({ where: { role }, order: { createTime: 'DESC' } });
    }
    return this.staffRepository.find({ order: { createTime: 'DESC' } });
  }

  async findOne(id: number): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: CreateStaffDto): Promise<Staff | null> {
    await this.staffRepository.update(id, dto);
    return this.staffRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.staffRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.staffRepository.delete({ id: In(ids) });
  }

  async getRoles(): Promise<string[]> {
    const result = await this.staffRepository
      .createQueryBuilder('s')
      .select('DISTINCT s.role', 'role')
      .getRawMany();
    return result.map((r) => r.role).filter(Boolean);
  }
}
