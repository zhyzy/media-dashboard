import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shooting } from './entities/shooting.entity';
import { CreateShootingDto, UpdateShootingDto } from './dto/shooting.dto';

@Injectable()
export class ShootingService {
  constructor(
    @InjectRepository(Shooting)
    private shootingRepository: Repository<Shooting>,
  ) {}

  async findAll(status?: string): Promise<Shooting[]> {
    if (status) {
      return this.shootingRepository.find({ where: { status }, order: { createTime: 'DESC' } });
    }
    return this.shootingRepository.find({ order: { createTime: 'DESC' } });
  }

  async findOne(id: number): Promise<Shooting | null> {
    return this.shootingRepository.findOne({ where: { id } });
  }

  async create(dto: CreateShootingDto): Promise<Shooting> {
    const shooting = this.shootingRepository.create(dto);
    return this.shootingRepository.save(shooting);
  }

  async update(id: number, dto: UpdateShootingDto): Promise<Shooting | null> {
    await this.shootingRepository.update(id, dto);
    return this.shootingRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.shootingRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    await this.shootingRepository.delete(ids);
  }
}
