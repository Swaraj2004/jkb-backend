import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES } from '../utils/consts';

export async function getLectureAttendance(req: Request, res: Response, lectureId: string) {
    try {

        const lecture = await prismaClient.lecture.findUnique({
            where: { id: lectureId },
            include: { subject: true }
        });

        if (!lecture) {
            res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Lecture not found", null));
            return;
        }

        // Find packageIds containing the subject   (ask Swaraj Bhaiya what is the need of packages)
        const packages = await prismaClient.package.findMany({
            where: {
                packageSubjects: {
                    some: { subject_id: lecture.subject_id }
                }
            },
            select: { id: true }
        });
        const packageIds = packages.map(pkg => pkg.id);

        // Find students enrolled in subject or packages
        const students = await prismaClient.studentDetail.findMany({
            where: {
                OR: [
                    { studentSubjects: { some: { subject_id: lecture.subject_id } } }, // Students directly enrolled in the subject
                    { studentPackages: { some: { package_id: { in: packageIds } } } } // Students enrolled via package
                ],
            },
            include: {
                user: { select: { full_name: true } }
            }
            // select: { id: true, college_name: true, },
        });

        // Get attendance records for current lecture
        const attendances = await prismaClient.attendance.findMany({
            where: { lecture_id: lectureId },
            select: { student_id: true }
        });
        const presentStudentIds = new Set(attendances.map(a => a.student_id));

        const studentAttendance = students.map(student => ({
            student_id: student.id,
            student_name: student.user?.full_name || "Unknown",
            student_college: student.college_name || "",
            present: presentStudentIds.has(student.id)
        }));

        res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Records fetched successfully", studentAttendance));
    } catch (error) {
        res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal server error", error));
    }
}
export async function getStudentAttendance(req: Request, res: Response, studentId: string) {
    try {
        // 1. Validate student existence using user_id
        const student = await prismaClient.studentDetail.findUnique({
            where: { user_id: studentId },
            include: {
                studentSubjects: { select: { subject_id: true } },
                studentPackages: {      // means collect subject which are enrolled in the packages
                    include: {
                        package: {
                            select: { packageSubjects: true }
                        }
                    }
                }
            }
        });

        if (!student) {
            res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Student not found", null));
            return;
        }

        // 2. Collect all relevant subject IDs
        const subjectIds = new Set<string>();

        // Add subjects from direct enrollments
        student.studentSubjects.forEach(({ subject_id }) =>
            subjectIds.add(subject_id)
        );

        // first use studentPackages relation to get Packages that StudentDetail is related with
        // then use package relation to get of StudentPackage
        // then use PackageSubjects relation to get the subjects related to a package
        student.studentPackages.forEach(({ package: pkg }) => {
            pkg.packageSubjects.forEach(subject =>
                subjectIds.add(subject.subject_id)
            );
        });

        if (subjectIds.size === 0) {
            res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("No enrolled subjects/packages found", null));
            return;
        }

        // 3. Get lectures with related data
        const lectures = await prismaClient.lecture.findMany({
            where: {
                subject_id: {
                    in: Array.from(subjectIds)
                }
            },
            include: {
                subject: { select: { name: true } },
                professor: { select: { full_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // 4. Get attendance records
        const attendanceRecords = await prismaClient.attendance.findMany({
            where: {
                student_id: student.id,
                lecture_id: { in: lectures.map(l => l.id) }
            },
            select: { lecture_id: true }
        });

        const presentLectureIds = new Set(
            attendanceRecords.map(record => record.lecture_id)
        );

        // 5. Format response data
        const attendanceData = lectures.map(lecture => ({
            lecture_id: lecture.id,
            subject_name: lecture.subject.name,
            professor_name: lecture.professor.full_name,
            lecture_mode: lecture.lecture_mode,
            status: presentLectureIds.has(lecture.id) ? 'present' : 'absent',
            attendance_toggle: lecture.attendance_toggle,
            created_at: lecture.created_at
        }));

        res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Attendance records retrieved successfully", attendanceData));
    } catch (error) {
        res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}

export async function markAttendance(req: Request, res: Response, lectureId: string, studentId: string) {
    try {
        if (!lectureId || !studentId) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("LectureId and StudentId required", null));
            return;
        }

        const attendance = await prismaClient.attendance.create({
            data: {
                lecture_id: lectureId,
                student_id: studentId
            }
        });

        res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Attendance Marked Successfully", attendance.id));
    } catch (error) {
        res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Internal server error", error));
    }
}