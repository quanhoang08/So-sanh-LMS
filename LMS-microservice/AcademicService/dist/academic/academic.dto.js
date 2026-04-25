"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignedLecturerResponseDto = void 0;
class AssignedLecturerResponseDto {
    id;
    lecturerId;
    courseId;
    targetId;
    assignmentRole;
    semester;
    assignedAt;
    static fromEntity(entity) {
        const dto = new AssignedLecturerResponseDto();
        dto.id = entity.id;
        dto.lecturerId = entity.lecturerId;
        dto.courseId = entity.courseId;
        dto.targetId = entity.targetId;
        dto.assignmentRole = entity.assignmentRole;
        dto.semester = entity.semester;
        dto.assignedAt = entity.assignedAt;
        return dto;
    }
}
exports.AssignedLecturerResponseDto = AssignedLecturerResponseDto;
//# sourceMappingURL=academic.dto.js.map