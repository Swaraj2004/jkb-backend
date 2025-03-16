import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import subjectController from '../controllers/subjectController'; // Adjust the import based on your project structure
// import { Subject, UpdateSubject } from '../schemas/subjectSchemas'; // Adjust the import based on your project structure

const router = express.Router();
const SUBJECT_COLLECTION_NAME = 'subjects'; // Define your collection name
const USER_COLLECTION_NAME = 'users'; // Define your user collection name
const COURSEPACKAGE_COLLECTION_NAME = 'coursePackages'; // Define your course package collection name
const STUDENT_DETAIL_COLLECTION_NAME = 'studentDetails'; // Define your student detail collection name
const LECTURE_COLLECTION_NAME = 'lectures'; // Define your lecture collection name
const ATTENDANCE_COLLECTION_NAME = 'attendance'; // Define your attendance collection name

/**
 * @swagger
 * tags:
 *   - name: Subject Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /subjects/{subject_id}:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get a specific subject by ID
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single subject object
 */
router.get('/subjects/:subject_id', async (req, res) => {
    // const subjectId = req.params.subject_id;
    // const readRecordId = convertToBsonId(subjectId); // Implement this function as needed
    // const subject = await subjectController.getRecords(dbInstance, readRecordId, SUBJECT_COLLECTION_NAME);
    // res.status(200).json(subject);
});

/**
 * @swagger
 * /subjects:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get all subjects
 *     responses:
 *       200:
 *         description: A list of subject objects
 */
router.get('/subjects', async (req, res) => {
    // const subjects = await subjectController.getRecords(dbInstance, null, SUBJECT_COLLECTION_NAME);
    // const subjectsDict = JSON.parse(subjects.body);

    // const records = subjectsDict['result'].map(subject => {
    //     const professorIds = subject['professor_user_ids'];
    //     const professors = professorIds.map(async professorId => {
    //         return await dbInstance[USER_COLLECTION_NAME].findOne({ _id: convertToBsonId(professorId) });
    //     });

    //     return {
    //         ...subject,
    //         professors: professors.map(professor => ({
    //             _id: String(professor._id),
    //             full_name: professor.full_name,
    //         })),
    //     };
    // });

    // return res.status(200).json({
    //     success: true,
    //     message: "Records fetched successfully",
    //     result: records,
    // });
});

/**
 * @swagger
 * /subject-users:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get users enrolled in a subject
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter by
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of users enrolled in the subject
 */
router.get('/subject-users', async (req, res) => {
    // const { subject_id, year } = req.query;

    // if (!subject_id) {
    //     return res.status(400).json({ success: false, message: "subject_id is required" });
    // }

    // const packages = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].find({ subjects: subject_id }, { _id: 1 }).toArray();
    // const packageIds = packages.map(doc => String(doc._id));
    // const filter = { $or: [{ subjects: subject_id }, { packages: { $in: packageIds } }] };

    // if (year) {
    //     filter["$expr"] = { "$eq": [{ "$year": "$created_at" }, year] };
    // }

    // const studentsWithSubject = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].aggregate([
    //     { $match: filter },
    //     student_aggregate,
    //     { $project: { "student.password": 0 } },
    // ]).toArray();

    // return res.status(200).json({
    //     success: true,
    //     message: "Records fetched successfully",
    //     result: studentsWithSubject,
    // });
});

/**
 * @swagger
 * /subject-attendance:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get attendance records for a subject
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance records for the subject
 */
router.get('/subject-attendance', async (req, res) => {
    // const { subject_id } = req.query;

    // if (!subject_id) {
    //     return res.status(400).json({ success: false, message: "subject_id is required" });
    // }

    // const lectures = await dbInstance[LECTURE_COLLECTION_NAME].find({ subject_id: convertToBsonId(subject_id) }, { _id: 1, created_at: 1 }).toArray();

    // if (!lectures.length) {
    //     return res.status(200).json({ success: false, message: "No lectures found for this subject", result: [] });
    // }

    // const lectureIds = lectures.map(lecture => lecture._id);
    // const lectureDates = lectures.reduce((acc, lecture) => {
    //     acc[String(lecture._id)] = lecture.created_at.toISOString().split('T')[0]; // Format date
    //     return acc;
    // }, {});

    // const packages = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].find({ subjects: subject_id }, { _id: 1 }).toArray();
    // const packageIds = packages.map(doc => String(doc._id));

    // const students = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].find({
    //     $or: [{ subjects: subject_id }, { packages: { $in: packageIds } }]
    // }).toArray();

    // if (!students.length) {
    //     return res.status(200).json({ success: false, message: "No students found for this subject", result: [] });
    // }

    // const attendanceRecords = await dbInstance[ATTENDANCE_COLLECTION_NAME].find({ lecture_id: { $in: lectureIds } }, { student_user_id: 1, lecture_id: 1 }).toArray();

    // const attendanceMap = {};
    // attendanceRecords.forEach(record => {
    //     const studentId = String(record.student_user_id);
    //     const lectureId = String(record.lecture_id);
    //     if (!attendanceMap[studentId]) {
    //         attendanceMap[studentId] = {};
    //     }
    //     attendanceMap[studentId][lectureId] = "present";
    // });

    // const userIds = students.map(student => student.student_id).filter(id => id);
    // const users = await dbInstance[USER_COLLECTION_NAME].find({ _id: { $in: userIds } }).toArray();
    // const userMap = users.reduce((acc, user) => {
    //     acc[String(user._id)] = user.full_name || "Unknown";
    //     return acc;
    // }, {});

    // const responseData = students.map(student => {
    //     const studentUserId = String(student.student_id);
    //     const studentName = userMap[studentUserId] || "Unknown";
    //     const row = { student_user_id: studentUserId, student_name: studentName };

    //     for (const [lectureId, date] of Object.entries(lectureDates)) {
    //         row[date] = attendanceMap[studentUserId]?.[lectureId] || "absent";
    //     }

    //     return row;
    // });

    // return res.status(200).json({
    //     success: true,
    //     message: "Attendance records fetched successfully",
    //     result: responseData,
    // });
});

/**
 * @swagger
 * /student-subjects/{student_id}:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get subjects for a specific student
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get subjects of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of subjects for the student
 */
router.get('/student-subjects/:student_id', async (req, res) => {
    // const studentId = req.params.student_id;
    // const studentRecordId = convertToBsonId(studentId);
    // const student = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ student_id: studentRecordId });

    // if (student) {
    //     const studentSubjects = await Promise.all(student.subjects.map(async subjectId => {
    //         return await dbInstance[SUBJECT_COLLECTION_NAME].findOne({ _id: convertToBsonId(subjectId) });
    //     }));

    //     return res.status(200).json({
    //         success: true,
    //         message: "Records fetched successfully",
    //         result: studentSubjects,
    //     });
    // }

    // return res.status(404).json({
    //     success: false,
    //     message: "User not found!",
    // });
});

/**
 * @swagger
 * /subjects:
 *   post:
 *     tags: [Subject Management]
 *     summary: Create a new subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: The created subject object
 */
router.post('/subjects', async (req, res) => {
    // const createRecord: Subject = req.body; // Ensure to validate the body
    // const newSubject = await subjectController.postRecord(dbInstance, req.user, createRecord, SUBJECT_COLLECTION_NAME);
    // res.status(201).json(newSubject);
});

/**
 * @swagger
 * /subjects/{subject_id}:
 *   delete:
 *     tags: [Subject Management]
 *     summary: Delete a subject by ID
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Subject deleted successfully
 */
router.delete('/subjects/:subject_id', async (req, res) => {
    // const subjectId = req.params.subject_id;
    // const existingPackage = await dbInstance[COURSEPACKAGE_COLLECTION_NAME].find({ subjects: { $elemMatch: { $eq: subjectId } } }).toArray();

    // if (existingPackage.length) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Record deletion failed! Packages exist within this subject!",
    //     });
    // }

    // await subjectController.deleteRecord(dbInstance, subjectId, SUBJECT_COLLECTION_NAME);
    res.status(204).send();
});

/**
 * @swagger
 * /subjects:
 *   put:
 *     tags: [Subject Management]
 *     summary: Update a subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubject'
 *     responses:
 *       202:
 *         description: The updated subject object
 */
router.put('/subjects', async (req, res) => {
    // const updatedRecord: UpdateSubject = req.body; // Ensure to validate the body
    // const updatedSubject = await subjectController.updateRecord(dbInstance, req.user, updatedRecord, SUBJECT_COLLECTION_NAME);
    // res.status(202).json(updatedSubject);
});

export default router;