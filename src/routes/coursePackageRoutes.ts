import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import coursePackageController from '../controllers/coursePackageController'; // Adjust the import based on your project structure
// import { CoursePackage, UpdateCoursePackage } from '../schemas/coursePackageSchemas'; // Adjust the import based on your project structure

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Course Package Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /course-packages/{course_package_id}:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get a specific course package by ID
 *     parameters:
 *       - in: path
 *         name: course_package_id
 *         required: true
 *         description: The ID of the course package to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single course package object
 */
router.get('/course-packages/:course_package_id', async (req, res) => {
    // const coursePackageId = req.params.course_package_id;
    // const readRecordId = convertToBsonId(coursePackageId); // Convert the course package ID to BSON format
    // const coursePackage = await coursePackageController.getRecords(
    //     dbInstance,
    //     readRecordId,
    //     COURSEPACKAGE_COLLECTION_NAME
    // );
    // res.status(200).json(coursePackage);
});

/**
 * @swagger
 * /course-packages:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get all course packages
 *     responses:
 *       200:
 *         description: A list of course package objects
 */
router.get('/course-packages', async (req, res) => {
    // const coursePackages = await coursePackageController.getRecords(
    //     dbInstance,
    //     null,
    //     COURSEPACKAGE_COLLECTION_NAME
    // );
    // res.status(200).json(coursePackages);
});

/**
 * @swagger
 * /subject-package-users:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get users enrolled in a specific subject package
 *     parameters:
 *       - in: query
 *         name: subject_package_id
 *         required: true
 *         description: The ID of the subject package
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
 *         description: A list of users enrolled in the subject package
 */
router.get('/subject-package-users', async (req, res) => {
    // const { subject_package_id, year } = req.query;

    // if (!subject_package_id) {
    //     return res.status(400).json({ success: false, message: "subject_package_id is required" });
    // }

    // const filter = { packages: subject_package_id };
    // if (year) {
    //     filter["$expr"] = { "$eq": [{ "$year": "$created_at" }, year] };
    // }

    // const aggregateFilter = [
    //     { $match: filter },
    //     student_aggregate,
    //     { $project: { "student.password": 0 } },
    // ];

    // const studentsWithSubjectPackage = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].aggregate(aggregateFilter).toArray();
    // const records = encode(studentsWithSubjectPackage);

    // return res.status(200).json({
    //     success: true,
    //     message: "Records fetched successfully",
    //     result: records,
    // });
});

/**
 * @swagger
 * /student-packages/{student_id}:
 *   get:
 *     tags: [Course Package Management]
 *     summary: Get course packages for a specific student
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get packages of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of course packages for the student
 */
router.get('/student-packages/:student_id', async (req, res) => {
    // const studentId = req.params.student_id;
    // const studentRecordId = convertToBsonId(studentId);
    // const student = await dbInstance[STUDENT_DETAIL_COLLECTION_NAME].findOne({ student_id: studentRecordId });

    // if (student) {
    //     const studentPackages = await Promise.all(student.packages.map(async packageId => {
    //         return await dbInstance[COURSEPACKAGE_COLLECTION_NAME].findOne({ _id: convertToBsonId(packageId) });
    //     }));

    //     return res.status(200).json({
    //         success: true,
    //         message: "Records fetched successfully",
    //         result: studentPackages.filter(pkg => pkg !== null), // Filter out any null packages
    //     });
    // }

    // return res.status(404).json({
    //     success: false,
    //     message: "User not found!",
    // });
});

/**
 * @swagger
 * /course-packages:
 *   post:
 *     tags: [Course Package Management]
 *     summary: Create a new course package
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoursePackage'
 *     responses:
 *       201:
 *         description: The created course package object
 */
router.post('/course-packages', async (req, res) => {
    // const createRecord: CoursePackage = req.body; // Get the course package data from the request body
    // const newCoursePackage = await coursePackageController.postRecord(
    //     dbInstance,
    //     req.user,
    //     createRecord,
    //     COURSEPACKAGE_COLLECTION_NAME
    // );
    // res.status(201).json(newCoursePackage);
});

/**
 * @swagger
 * /course-packages/{course_package_id}:
 *   delete:
 *     tags: [Course Package Management]
 *     summary: Delete a course package by ID
 *     parameters:
 *       - in: path
 *         name: course_package_id
 *         required: true
 *         description: The ID of the course package to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Course package deleted successfully
 */
router.delete('/course-packages/:course_package_id', async (req, res) => {
    // const coursePackageId = req.params.course_package_id;
    // await coursePackageController.deleteRecord(
    //     dbInstance,
    //     coursePackageId,
    //     COURSEPACKAGE_COLLECTION_NAME
    // );
    // res.status(204).send();
});

/**
 * @swagger
 * /course-packages:
 *   put:
 *     tags: [Course Package Management]
 *     summary: Update a course package
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCoursePackage'
 *     responses:
 *       202:
 *         description: The updated course package object
 */
router.put('/course-packages', async (req, res) => {
    // const updatedRecord: UpdateCoursePackage = req.body; // Get the updated course package data from the request body
    // const updatedCoursePackage = await coursePackageController.updateRecord(
    //     dbInstance,
    //     req.user,
    //     updatedRecord,
    //     COURSEPACKAGE_COLLECTION_NAME
    // );
    // res.status(202).json(updatedCoursePackage);
});

export default router;
