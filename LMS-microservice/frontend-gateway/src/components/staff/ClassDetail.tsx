import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Material {
    id: string;
    name: string;
    fileUrl: string;
    orderIndex: number;
}

interface Lesson {
    id: number;
    title: string;
    summary?: string;
    orderIndex: number;
    materials: Material[];
}

interface CourseDetail {
    id: string;
    title: string;
    description?: string;
    status: string;
    lessons: Lesson[];
    enrollments: Enrollment[]
}

interface Enrollment {
    id: string;
    progressPct: number;
    student: {
        fullname: string;
        email: string;
    };
}

export default function ClassDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // fetch course detail
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const res = await axios.get(`http://localhost:8080/api/v1/courses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Lấy ra course và enrollments từ res.data
                const { course, enrollments } = res.data;

                // Mapping lại dữ liệu để khớp với HTML (Mock thêm dữ liệu student vì API đang thiếu)
                const mappedCourse: CourseDetail = {
                    ...course,
                    enrollments: enrollments.map((e: any) => ({
                        ...e,
                        // Giả lập dữ liệu student nếu backend chưa trả về object student
                        student: e.student || {
                            fullname: `Sinh viên ${e.studentId.slice(0, 5)}`,
                            email: "student@example.com"
                        },
                        // Giả lập % tiến độ nếu backend chưa có
                        progressPct: Math.floor(Math.random() * 100)
                    }))
                };

                setCourse(mappedCourse);
            } catch (err) {
                console.error("Lỗi lấy chi tiết khóa học:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-10 text-white">Đang tải...</div>;
    if (!course) return <div className="p-10 text-red-400">Không tìm thấy khóa học</div>;

    const renderStatus = () => {
        switch (course.status) {
            case "Đã mở đăng ký":
                return <span className="text-green-400">Đang hoạt động</span>;
            case "Dự kiến mở":
                return <span className="text-yellow-400">Chờ duyệt</span>;
            case "Đã đóng":
                return <span className="text-red-400">Đã đóng</span>;
            default:
                return <span className="text-blue-400">Khác</span>;
        }
    };

    console.log("khóa học lấy được: ", course);
    return (
        <div className="p-6 text-white bg-[#0d1117] min-h-screen">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate("/staff/classes")}
                    className="p-2 bg-[#21262d] rounded hover:bg-[#30363d]"
                >
                    ←
                </button>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono bg-green-500/10 text-green-400 px-2 py-1 rounded">
                            COURSE-{course.id}
                        </span>
                        {renderStatus()}
                    </div>

                    <h1 className="text-2xl font-bold">{course.title}</h1>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: LESSONS */}
                <div className="lg:col-span-2 space-y-4">

                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Danh sách bài giảng</h2>

                        <button className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm">
                            + Thêm bài giảng
                        </button>
                    </div>

                    {course.lessons?.length === 0 ? (
                        <div className="text-gray-400">Chưa có bài giảng</div>
                    ) : (
                        course.lessons
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((lesson) => (
                                <div key={lesson.id} className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">

                                    {/* Header lesson */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded">
                                            {lesson.orderIndex}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{lesson.title}</h3>
                                            <p className="text-xs text-gray-400">{lesson.summary}</p>
                                        </div>
                                    </div>

                                    {/* Materials */}
                                    <div className="ml-10 flex flex-col gap-2">
                                        {lesson.materials?.length > 0 ? (
                                            lesson.materials
                                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                                .map((mat) => (
                                                    <a
                                                        key={mat.id}
                                                        href={mat.fileUrl}
                                                        target="_blank"
                                                        className="text-sm text-blue-400 hover:underline flex items-center gap-2"
                                                    >
                                                        📄 {mat.name}
                                                    </a>
                                                ))
                                        ) : (
                                            <span className="text-xs text-gray-500">Chưa có học liệu</span>
                                        )}
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* RIGHT: EDIT + STUDENTS */}
                <div className="space-y-6">

                    {/* EDIT COURSE */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
                        <h2 className="font-semibold">Chỉnh sửa khóa học</h2>

                        <input
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2"
                            defaultValue={course.title}
                        />

                        <textarea
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2"
                            defaultValue={course.description}
                        />

                        <button className="bg-green-600 px-3 py-2 rounded hover:bg-green-500 w-full">
                            Lưu thay đổi
                        </button>
                    </div>

                    {/* STUDENTS */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                        <h2 className="font-semibold mb-3">Sinh viên ghi danh</h2>

                        {course.enrollments.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center">Chưa có sinh viên</p>
                        ) : (
                            <div className="space-y-3">
                                {course.enrollments.map((e) => (
                                    <div key={e.id}>
                                        <div className="flex justify-between text-sm">
                                            <div>
                                                <p>{e.student.fullname}</p>
                                                <p className="text-xs text-gray-400">{e.student.email}</p>
                                            </div>
                                            <span>{e.progressPct}%</span>
                                        </div>

                                        {/* PROGRESS BAR */}
                                        <div className="w-full h-2 bg-[#30363d] rounded mt-1">
                                            <div
                                                className="h-2 rounded"
                                                style={{
                                                    width: `${e.progressPct}%`,
                                                    background:
                                                        e.progressPct >= 80
                                                            ? "#3fb950"
                                                            : e.progressPct >= 50
                                                                ? "#1f6feb"
                                                                : "#f85149"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}