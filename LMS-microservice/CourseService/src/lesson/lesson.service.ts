import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { Lesson } from './lesson.entity';
import { CourseStatus } from '../course/course.enum';
import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';
import { DataSource, Repository } from 'typeorm';
import { Course } from '../course/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from '../material/material.entity';

/**
 * Giảng viên chỉ được chỉnh sửa nội dung khi khóa học ở trạng thái DRAFT hoặc PENDING
 */
const EDITABLE_STATUSES: CourseStatus[] = [
    CourseStatus.CLOSED,
    CourseStatus.CANCELLED,
    CourseStatus.OPEN,
];

@Injectable()
export class LessonService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepo: Repository<Lesson>,
        @InjectRepository(Course)
        private readonly courseRepo: Repository<Course>,
        @InjectRepository(Lesson)
        private readonly materialRepo: Repository<Material>,

        private readonly dataSource: DataSource,
    ) { }

    /**
     * 
     * @param courseId 
     * lấy ra danh sách các bài giảng trong một khóa học (thông qua course id)
     */
    async findByCourse(courseId: string): Promise<Lesson[]> {
        const lessons = await this.lessonRepo.find({
            where: { course: { id: courseId } },
        });

        // Nếu bạn muốn báo lỗi khi không có bài học nào
        if (!lessons || lessons.length === 0) {
            throw new NotFoundException('Không tìm thấy bài học nào cho khóa học này.');
        }

        return lessons;
    }

    /**
     * 
     * @param id 
     * @returns 
     * tìm bài giảng thông qua id của bài giảng đó
     */
    async findOne(id: number): Promise<Lesson> {
        const lesson = await this.lessonRepo.findOne({
            where: {
                id: id
            }
        });
        if (!lesson) throw new NotFoundException('Không tìm thấy bài giảng.');
        return lesson;
    }

    /**
     * Khởi tạo một bài giảng cho một khóa học
     * @param courseId 
     * @param dto 
     * @param lecturerId 
     * @returns 
     */
    async create(courseId: string, dto: CreateLessonDto, lecturerId: number): Promise<Lesson> {
        const course = await this.courseRepo.findOne({
            where: {
                id: courseId
            }
        });

        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');

        if (!EDITABLE_STATUSES.includes(course.status))
            throw new BadRequestException(
                'Không thể thêm bài giảng khi khóa học đã ở trạng thái OPEN, CANCEL hoặc CLOSE.',
            );

        const queryResult = await this.lessonRepo
            .createQueryBuilder('lesson')
            .select('MAX(lesson.orderIndex)', 'max')
            .where('lesson.courseId = :courseId', { courseId })
            .getRawOne();
        // ✅ dto.orderIndex đã có trong CreateLessonDto (sau khi fix dto)
        const orderIndex = queryResult?.max ? parseInt(queryResult.max) : 0;

        return this.lessonRepo.create({
            title: dto.title,
            summary: dto.summary,    // ✅ dto.summary có trong CreateLessonDto
            content: dto.content,
            orderIndex,
            course: { id: courseId } as any,
        });
    }

    /**
     * Cập nhật một bài giảng trong 1 khóa học
     * @param id 
     * @param dto 
     * @param lecturerId 
     * @returns 
     */
    async update(id: number, dto: UpdateLessonDto, lecturerId: number): Promise<Lesson> {
        const lesson = await this.findOne(id);
        const course = await this.courseRepo.findOne({
            where: {
                id: lesson.course.id
            }
        });

        if (!EDITABLE_STATUSES.includes(course!.status))
            throw new BadRequestException('Không thể chỉnh sửa bài giảng trong khóa học đã ở trạng thái OPEN, CANCEL hoặc CLOSE.');

        // 3. Ghi đè các giá trị mới từ DTO vào object lesson hiện tại
        // Object.assign sẽ chỉ ghi đè các trường có trong dto
        Object.assign(lesson, dto);

        // 4. Lưu lại (TypeORM sẽ tự động thực hiện lệnh UPDATE)
        return await this.lessonRepo.save(lesson);
    }

    /**
     * Sắp xếp thứ tự bài giảng trong một khóa học
     * @param courseId 
     * @param lessonId 
     * @param newOrderIndex 
     * @param lecturerId 
     * @returns 
     */
    async reorder(
        courseId: string,
        lessonId: number,
        newOrderIndex: number,
        lecturerId: number,
    ): Promise<Lesson> {
        const course = await this.courseRepo.findOne({
            where: {
                id: courseId
            }
        });

        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');

        const lesson = await this.lessonRepo.findOne({
            where: {
                id: lessonId
            }
        });
        if (!lesson) throw new NotFoundException('Không tìm thấy bài giảng.');
        const oldOrderIndex = lesson.orderIndex;
        if (oldOrderIndex === newOrderIndex) return lesson;
        // 3. Thực hiện dịch chuyển các bài giảng khác trong Transaction
        // Bạn cần inject DataSource vào constructor: constructor(private dataSource: DataSource, ...)
        return await this.dataSource.transaction(async (manager) => {
            if (newOrderIndex > oldOrderIndex) {
                // Trường hợp: Đẩy bài giảng xuống dưới (ví dụ từ 2 -> 5)
                // Giảm index của các bài từ 3 đến 5 đi 1 đơn vị
                await manager
                    .createQueryBuilder()
                    .update(Lesson)
                    .set({ orderIndex: () => 'orderIndex - 1' })
                    .where('courseId = :courseId AND orderIndex > :old AND orderIndex <= :new', {
                        courseId,
                        old: oldOrderIndex,
                        new: newOrderIndex,
                    })
                    .execute();
            } else {
                // Trường hợp: Kéo bài giảng lên trên (ví dụ từ 5 -> 2)
                // Tăng index của các bài từ 2 đến 4 lên 1 đơn vị
                await manager
                    .createQueryBuilder()
                    .update(Lesson)
                    .set({ orderIndex: () => 'orderIndex + 1' })
                    .where('courseId = :courseId AND orderIndex >= :new AND orderIndex < :old', {
                        courseId,
                        old: oldOrderIndex,
                        new: newOrderIndex,
                    })
                    .execute();
            }

            // 4. Cập nhật vị trí mới cho bài giảng hiện tại
            lesson.orderIndex = newOrderIndex;
            return await manager.save(lesson);
        });
    }

    async delete(id: number, lecturerId: number): Promise<void> {
        const lesson = await this.findOne(id);
        const course = await this.courseRepo.findOne({
            where: {
                id: lesson.course.id
            }
        });
        await this.lessonRepo.delete(id);
    }
}
