import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindManyOptions } from 'typeorm';
import { User } from './user.entity';
import { UserRole, AccountStatus } from './user.enum';


@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    // gọi super với Entity và EntityManager
    super(User, dataSource.createEntityManager());
  }

  /**
   * TÌM KIẾM NGƯỜI DÙNG THEO ID
   */
  async findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  /**
   * TÌM KIẾM THEO EMAIL (Phục vụ Login/Check tồn tại)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * LẤY DANH SÁCH NGƯỜI DÙNG
   */
  async findAll(options?: FindManyOptions<User>): Promise<User[] | null> {
    return this.find(options);
  }

  /**
   * TẠO MỚI TÀI KHOẢN
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.create(userData);
    return this.save(newUser);
  }

  /**
   * CẬP NHẬT THÔNG TIN TÀI KHOẢN
   */
  async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.update(id, updateData);
    return this.findById(id);
  }

  /**
   * VÔ HIỆU HÓA HOẶC XÓA TÀI KHOẢN
   */
  async deleteUser(id: number): Promise<void> {
    await this.delete(id);
  }

  /**
   * CẬP NHẬT TRẠNG THÁI KHÓA TÀI KHOẢN
   */
  async updateLockStatus(
    id: number,
    failedAttempts: number,
    lockedUntil: Date
  ): Promise<User | null> {
    await this.update(id, {
      failedLoginAttempts: failedAttempts,
      lockedUntil: lockedUntil,
    });
    return this.findById(id);
  }
}
