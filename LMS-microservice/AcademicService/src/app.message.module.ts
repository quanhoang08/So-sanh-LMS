import {Module} from "@nestjs/common"
import { AppMessageController } from "./app.message.controller";
import { EnrollmentModule } from "./enrollment/enrollment.module";
import { LecturerModule } from "./lecturer/lecturer.module";
import { StudentModule } from "./student/student.module";

@Module({
  imports: [StudentModule, EnrollmentModule, LecturerModule], // Import các module cần thiết
  controllers: [AppMessageController],
//   exports
  providers: [],
})
export class MessageModule {}