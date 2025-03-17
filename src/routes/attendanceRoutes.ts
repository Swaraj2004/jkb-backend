import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import webController from '../controllers/webController'; // Adjust the import based on your project structure
// import { MarkAttendance, LectureUpdateToggle } from '../schemas/attendanceSchemas'; // Adjust the import based on your project structure

const router = express.Router();
const LECTURE_COLLECTION_NAME = 'lectures'; // Define your lecture collection name
const ATTENDANCE_COLLECTION_NAME = 'attendance'; // Define your attendance collection name
const STUDENT_DETAIL_COLLECTION_NAME = 'studentDetails'; // Define your student detail collection name
const COURSEPACKAGE_COLLECTION_NAME = 'coursePackages'; // Define your course package collection name
const USER_COLLECTION_NAME = 'users'; // Define your user collection name
const AUTH_ROLES = ['admin', 'super-admin']; // Define your authorization roles

/**
 * @swagger
 * tags:
 *   - name: Attendance Management
 *     description: Operations related to attendance management
 */

/**
 * @swagger
 * /lectures/{lecture_id}/attendance:
 *   get:
 *     tags: [Attendance Management]
 *     summary: Get attendance for a specific lecture
 *     parameters:
 *       - in: path
 *         name: lecture_id
 *         required: true
 *         description: The ID of the lecture to get attendance for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of student attendance records
 */
router.get('/lectures/:lecture_id/attendance', async (req, res) => {
    // const lectureId = req.params.lecture_id; // Get lecture ID from the path parameters
    // const lecture = await dbInstance[LECTURE_COLLECTION_NAME].findOne({ _id: convertToBsonId(lectureId) });

    // if (!lecture) {
    //     return res.status(404).json({ success: false, message: "Lecture not found" });
    // }

    // const subjectId = String(lecture.subject_id);

    // // Find packages containing the subject
    // const packageCursor = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].find({ subjects: subjectId }, { _id: 1 }).toArray();
    // const packageIds = packageCursor.map(pkg => String(pkg._id)); // Convert ObjectIds to strings

    // // Find students enrolled in the subject or any of the found packages
    // const students = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].find({
    //     $or: [
    //         { subjects: subjectId },
    //         { packages: { $in: packageIds } }
    //     ]
    // }).toArray();

    // // Fetch user details for student names
    // const userIds = students.map(student => student.student_id).filter(id => id); // Extract user IDs
    // const users = await dbInstance[USER_COLLECTION_NAME].find({ _id: { $in: userIds } }).toArray();

    // // Create a mapping of user_id to full_name
    // const userMap = Object.fromEntries(users.map(user => [String(user._id), user.full_name || ""]));

    // // Fetch attendance records for this lecture
    // const attendanceRecords = await dbInstance[ATTENDANCE_COLLECTION_NAME].find({ lecture_id: convertToBsonId(lectureId) }).toArray();
    // const presentStudents = new Set(attendanceRecords.map(record => record.student_user_id));

    // // Format response
    // const studentAttendance = students.map(student => ({
    //     student_id: String(student._id),
    //     student_name: userMap[student.student_id] || "",
    //     student_college: student.college_name || "",
    //     present: presentStudents.has(student._id)
    // }));

    // return res.json({
    //     success: true,
    //     message: "Records fetched successfully",
    //     result: studentAttendance
    // });
});

/**
 * @swagger
 * /lectures/{lecture_id}/toggle-attendance:
 *   put:
 *     tags: [Attendance Management]
 *     summary: Toggle attendance for a specific lecture
 *     parameters:
 *       - in: path
 *         name: lecture_id
 *         required: true
 *         description: The ID of the lecture to update
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance toggle updated successfully
 */
router.put('/lectures/:lecture_id/toggle-attendance', async (req, res) => {
    // const lectureId = req.params.lecture_id; // Get lecture ID from the path parameters
    // const updateData = { record_id: lectureId, attendance_toggle: false };

    // const updatedLecture = await webController.update_record(
    //     dbInstance,
    //     req.user,
    //     new LectureUpdateToggle(updateData),
    //     LECTURE_COLLECTION_NAME
    // );

    // return res.json(updatedLecture);
});

/**
 * @swagger
 * /student/mark-attendance:
 *   post:
 *     tags: [Attendance Management]
 *     summary: Mark attendance for a student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkAttendance'
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 */
router.post('/student/mark-attendance', async (req, res) => {
    // const attendanceData: MarkAttendance = req.body; // Get attendance data from the request body
    // const newAttendanceRecord = await webController.post_record(
    //     dbInstance,
    //     req.user,
    //     attendanceData,
    //     ATTENDANCE_COLLECTION_NAME,
    //     ["lecture_id", "student_user_id"]
    // );

    // return res.status(201).json(newAttendanceRecord);
});

/**
 * @swagger
 * /student/attendance:
 *   get:
 *     tags: [Attendance Management]
 *     summary: Get attendance records for a specific student
 *     parameters:
 *       - in: query
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get attendance for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of attendance records for the student
 */
router.get('/student/attendance', async (req, res) => {
    // const studentId = req.query.student_id; // Get student ID from query parameters
    // const student = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ student_id: convertToBsonId(studentId) });

    // if (!student) {
    //     return res.status(404).json({ success: false, message: "Student not found" });
    // }

    // // Get subject IDs from student's subjects and packages
    // const subjectIds = new Set(student.subjects || []);
    // const packageIds = student.packages || [];

    // if (packageIds.length) {
    //     const packages = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].find({ _id: { $in: packageIds } }).toArray();
    //     packages.forEach(package => {
    //         package.subjects.forEach(subject => subjectIds.add(subject)); // Add subjects from packages
    //     });
    // }

    // if (!subjectIds.size) {
    //     return res.json({ success: false, message: "No subjects found for student", result: [] });
    // }

    // // Convert subject IDs to BSON ObjectId
    // const subjectIdArray = Array.from(subjectIds).map(subjectId => convertToBsonId(subjectId));
    // const lectures = await dbInstance[LECTURE_COLLECTION_NAME].find({ subject_id: { $in: subjectIdArray } }).toArray();

    // // Get attendance records for this student
    // const attendanceRecords = new Set(
    //     (await dbInstance[ATTENDANCE_COLLECTION_NAME].find({ student_user_id: convertToBsonId(studentId) }).toArray()).map(record => String(record.lecture_id))
    // );

    // // Format response with Present/Absent status
    // const attendanceData = await Promise.all(lectures.map(async lecture => {
    //     const subject = await dbInstance[SUBJECT_COLLECTION_NAME].findOne({ _id: lecture.subject_id });
    //     const subjectName = subject ? subject.name : "";

    //     const professor = await dbInstance[USER_COLLECTION_NAME].findOne({ _id: lecture.prof_user_id });
    //     const professorName = professor ? professor.full_name : "";

    //     return {
    //         lecture_id: String(lecture._id),
    //         subject_name: subjectName,
    //         professor_name: professorName,
    //         lecture_mode: lecture.lecture_mode,
    //         status: attendanceRecords.has(String(lecture._id)) ? "present" : "absent",
    //         attendance_toggle: lecture.attendance_toggle,
    //         created_at: lecture.created_at
    //     };
    // }));

    // // Sort by created_at in descending order
    // attendanceData.sort((a, b) => b.created_at - a.created_at);

    // return res.json({
    //     success: true,
    //     message: "Records fetched successfully",
    //     result: attendanceData
    // });
});

export default router;
