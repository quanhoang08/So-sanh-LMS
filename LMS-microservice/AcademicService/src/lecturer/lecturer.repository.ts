import { Lecturer } from "./lecturer.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";



@Injectable()
export class LecturerRepository extends Repository<Lecturer>{
  constructor(private dataSource: DataSource) {
    super(Lecturer, dataSource.createEntityManager());
  }

  async findByUserId(userId: number): Promise<Lecturer | null> {
    return this.findOne({ where: { userId: userId } });
  }

  async findByLecturerId(lecturerId: string): Promise<Lecturer | null> {
    return this.findOne({ where: { id: lecturerId } });
  }

  // Thỏa mãn: Xem danh sách giảng viên kèm chuyên môn
  async findAll(): Promise<Lecturer[] | null> {
    return this.find();
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.update(id, { status: status as any });
  }
  async createLecturer(data: {
    lecturerId: string,
    email: string,
    fullname?: string;        // optional
    lecturerCode?: string;   // optional
    status?: string;
  }) {
   
    return this.save(
      await this.create({
        id: data.lecturerId,
        email: data.email,
        fullname: data.fullname,              // có thể undefined
        status: data.status ?? 'ACTIVE',      // nếu không truyền thì mặc định ACTIVE
        lecturerCode: data.lecturerCode,    // có thể undefined
      })
    );
  }

  async deleteByUserId(userId: number) {
    return this.delete(userId);
  }

  async findByIds(ids: string[]) {
    return this.find({
      where: {
        id: In(ids),
      },
    });
  }
}