import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EnrollmentRepository } from './enrollment.repository';
import { Enrollment } from './enrollment.entity';
@Injectable()
export class EnrollmentService implements OnModuleInit {
    constructor(
        // ... inject repository của Enrollment ..
        private readonly enrollmentRepository: EnrollmentRepository,
        @Inject('COURSE_SERVICE') private readonly courseClient: ClientProxy,
    ) { }

    async onModuleInit() {
        await this.courseClient.connect(); // 🔥 BẮT BUỘC
    }

    /**
     *  
     * @param studentId 
     * @returns 
     */
    async getAllStudentInEnrollmentById(courseId: string){
        return await this.enrollmentRepository.find({
            where : {
                courseId: courseId
            }
        });
    }
    async getStudentDashboard(studentId: string) {
        const enrollments = await this.enrollmentRepository.find({
            where: { studentId }
        });

        const enrollmentMap = new Map(
            enrollments.map(e => [e.courseId, e.enrollmentStatus])
        );

        const openCourses = await firstValueFrom(
            this.courseClient.send({ cmd: 'get_available_courses' }, [])
        );

        const instructorIds = [
            ...new Set(openCourses.map(c => c.instructorId))
        ];

        const enrichedCourses = openCourses.map(course => ({
            ...course,
            enrollmentStatus: enrollmentMap.get(course.id) || 'UNENROLLMENT'
        }));

        const registeredCourses = enrichedCourses.filter(
            c => c.enrollmentStatus === 'ACTIVE' || c.enrollmentStatus === 'COMPLETED'
        );

        const availableCourses = enrichedCourses.filter(
            c => c.enrollmentStatus === 'UNENROLLMENT'
        );

        return {
            registeredCourses,
            availableCourses
        };
    }
}